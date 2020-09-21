const Mutation = {
    async createItem(parent, args, ctx, info) {
        //TODO: Check if they are logged in
        return await ctx.db.mutation.createItem({
            data: {...args}
        }, info);
    }
};

module.exports = Mutation;

