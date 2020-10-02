const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');

const oneDay = 1000 * 60 * 60 * 24;
const oneHour = 3600000;

const Mutation = {
    async createItem(parent, args, ctx, info) {
        //TODO: Check if they are logged in
        return await ctx.db.mutation.createItem({
            data: {...args}
        }, info);
    },
    updateItem(parent, args, ctx, info) {
        const updates = {...args};
        delete updates.id;
        return ctx.db.mutation.updateItem({ data: updates, where: { id: args.id }}, info);
    },
    async deleteItem(parent, args, ctx, info) {
        const where = { id: args.id };
        await ctx.db.query.item({ where }, `{ id, title }`);
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
};

module.exports = Mutation;

