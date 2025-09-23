const { prisma } = require('../prisma/prisma-client');

const CommentController = {
    createComment: async (req, res) => {
        const { postId, content } = req.body;
        const userId = req.user?.userId; // проверяем, что есть userId

        if (!postId || !content) {
            return res.status(400).json({ error: 'Все поля обязательны' })
        }

        if (!userId) {
            return res.status(401).json({ error: 'Пользователь не авторизован' })
        }

        try {
            const comment = await prisma.comment.create({
                data: {
                    content,
                    post: { connect: { id: postId } },   // связь с постом
                    user: { connect: { id: userId } }    // связь с юзером
                }
            })

            res.json(comment);
        } catch (error) {
            console.error('Error creating comment', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
    deleteComment: async (req, res) => {
        const { id } = req.params;
        const userId = req.user?.userId; // токен

        if (!userId) {
            return res.status(401).json({ error: 'Пользователь не авторизован' })
        }

        try {
            const comment = await prisma.comment.findUnique({ where: { id } })
            
            if (!comment) {
                return res.status(404).json({ error: 'Комментарий не найден' })
            }

            // Проверяем доступ (только автор может удалить свой коммент)
            if (comment.userId.toString() !== userId.toString()) {
                return res.status(403).json({ error: 'Нет доступа' })
            }

            await prisma.comment.delete({ where: { id } })

            res.json({ message: 'Комментарий успешно удалён', id })
        } catch (error) {
            console.error('Error delete comment', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

}

module.exports = CommentController;