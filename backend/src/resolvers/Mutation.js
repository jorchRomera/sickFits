const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {hasPermission} = require("../utils");
const { transport, makeANiceEmail } = require("../mail");
const { randomBytes } = require('crypto');
const { promisify } = require('util');

const oneDay = 1000 * 60 * 60 * 24;
const oneHour = 3600000;

const Mutation = {
    async createItem(parent, args, ctx, info) {
        if (!ctx.request.userId) throw new Error('You must be logged in to do that!');
        return await ctx.db.mutation.createItem({
            data: {
                user: { connect: { id: ctx.request.userId }},
                ...args,
            }
        }, info);
    },
    updateItem(parent, args, ctx, info) {
        const updates = {...args};
        delete updates.id;
        return ctx.db.mutation.updateItem({ data: updates, where: { id: args.id }}, info);
    },
    async deleteItem(parent, args, ctx, info) {
        const where = { id: args.id };
        const item = await ctx.db.query.item({ where }, `{ id, title user { id }}`);
        const ownsItem = item.user.id === ctx.request.userId;
        const hasPermissions = ctx.request.user.permissions.some(
            permission => ['ADMIN', 'ITEMDELETE'].includes(permission)
        );
        if (!ownsItem && !hasPermissions) throw new Error('You don\'t have permissions to do that');
        return ctx.db.mutation.deleteItem({ where }, info);
    },
    async signup(parent, args, ctx, info) {
        args.email = args.email.toLowerCase();
        const password = await bcrypt.hash(args.password, 10);
        const user = await ctx.db.mutation.createUser(
            { data: { ...args, password, permissions: { set: ['USER'] }}},
            info
        );
        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
        ctx.response.cookie('token', token, { httpOnly: true, maxAge: oneDay });
        return user;
    },
    async signin(parent, { email, password }, ctx, info) {
        const user = await ctx.db.query.user({ where: { email }});
        if (!user) throw new Error(`No such user found for email ${email}`);
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new Error('Invalid Password!');
        const token = jwt.sign({ userId: user.id}, process.env.APP_SECRET);
        ctx.response.cookie('token', token, { httpOnly: true, maxAge: oneDay });
        return user;
    },
    signout(parent, args, ctx, info) {
        ctx.response.clearCookie('token');
        return { message: 'Goodbye!' };
    },
    async requestReset(parent, { email }, ctx, info) {
        const user = await ctx.db.query.user({ where: { email }});
        if (!user) throw new Error(`No such user found for email ${email}`);
        const randomBytesPromisified = promisify(randomBytes);
        const resetToken = (await randomBytesPromisified(20)).toString('hex');
        const resetTokenExpiry = Date.now() + oneHour;
        await ctx.db.mutation.updateUser({
            where: { email },
            data: { resetToken, resetTokenExpiry }
        });
        await transport.sendMail({
            from: 'jorge.a.romera@gmail.com',
            to: email,
            subject: 'Your Password Reset Token',
            html: makeANiceEmail(`Your password reset token is here!
            \n\n
            <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Click here to reset</a>`)
        });
        return { message: 'Thanks!' };
    },
    async resetPassword(parent, { password, confirmPassword, resetToken }, ctx, info) {
        if ( password !== confirmPassword ) throw new Error('Your password don\'t match');
        const [user] = await ctx.db.query.users({
            where: {
                resetToken,
                resetTokenExpiry_gte: Date.now - oneHour,
            },
        });
        if (!user) throw new Error('This token is either invalid or expired!');
        const newPassword = await bcrypt.hash(password, 10);
        const updatedUser = await ctx.db.mutation.updateUser({
            where: { email: user.email },
            data: { password: newPassword, resetToken: null, resetTokenExpiry: null },
        });
        const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
        ctx.response.cookie('token', token, { httpOnly: true, maxAge: oneDay });
        return updatedUser;
    },
    async updatePermissions(parent, args, ctx, info) {
        if (!ctx.request.userId) throw new Error('You must be logged in');
        const currentUser = await ctx.db.query.user({
            where : {
                id: ctx.request.userId,
            }
        }, info );
        hasPermission(currentUser, ['ADMIN', 'PERMISSIONUPDATE']);
        return ctx.db.mutation.updateUser({
            data: {
                permissions: {
                    set: args.permissions
                }
            },
            where: {
                id: args.userId
            },
        }, info);
    },
    async addToCart(parent, args, ctx, info) {
        const { userId } = ctx.request;
        if (!userId) throw new Error('You must be logged in');
        const [existingCartItem] = await ctx.db.query.cartItems({
            where: {
                user: { id: userId },
                item: { id: args.id },
            }
        });
        if (existingCartItem) {
            return ctx.db.mutation.updateCartItem({
                where: { id: existingCartItem.id },
                data: { quantity: existingCartItem.quantity + 1 },
            }, info);
        }
        return ctx.db.mutation.createCartItem({
            data: {
                user: {
                    connect: { id: userId },
                },
                item: {
                    connect: { id: args.id },
                }
            }
        }, info);
    },
    async removeFromCart(parent, args, ctx, info) {
        const cartItem = await ctx.db.query.cartItem({
            where: {
                id: args.id,
            },
        }, `{ id, user { id }}`);
        if (!cartItem) throw new Error('No cart item found!');
        if (cartItem.user.id !== ctx.request.userId) throw new Error('Cheating huuuhhh')
        return ctx.db.mutation.deleteCartItem({
            where: { id: args.id }
        }, info);
    },
};

module.exports = Mutation;

