const { prisma } = require('../prisma/prisma-client');

const FollowController = {
    followUser: async (req, res) => {
        const { followingID } = req.body;
        const userId = req.user.userId;

        if (followingID === userId) {
            return res.status(500).json({error: 'Вы не можете подписаться на самого себя'})
        }

        try {
            const existingSubscription = await prisma.follows.findFirst({
                where: {
                    AND: [
                        { followerID: userId },
                        { followingID }
                    ]
                }
            })

            if (existingSubscription) {
                return res.status(400).json({error: 'Вы уже подписаны'})
            }

            await prisma.follows.create({
                data: {
                    follower: {connect: { id: userId }},
                    following: {connect: { id: followingID }}
                }
            })

            res.status(201).json({message: 'Вы успешно подписались'})
        } catch (error) {
            console.error('Follow error', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    unfollowUser: async (req, res) => {
        const { followingID } = req.body;
        const userId = req.user.userId;

        try {
            const follows = await prisma.follows.findFirst({
                where: {
                    AND: [
                        { followerID: userId },
                        { followingID }
                    ]
                }
            })

            if (!follows) {
                return res.status(404).json({error: 'Вы не подписаны на этого пользователя'})
            }

            await prisma.follows.delete({
                where: { id: follows.id }
            })

            res.status(201).json({message: 'Подписка успешно отменена'})
        } catch (error) {
            console.error('Unfollow error', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = FollowController;