const UserRepository = require('../repositories/UserRepository');
const { success, error } = require('../utils/response');

class UserController {
    async index(req, res) {
        try {
            const conditions = [];

            if (req.query.keyword) {
                conditions.push({ key: 'name', value: req.query.keyword, operation: 'like' });
            }

            if (req.query.status) {
                conditions.push({ key: 'status', value: req.query.status, operation: '=' });
            }

            const result = await UserRepository.search(conditions, {
                limit: parseInt(req.query.limit) || 10,
                page: parseInt(req.query.page) || 1,
            });

            return success(res, result);
        } catch (err) {
            return error(res, err.message);
        }
    }

    async store(req, res) {
        try {
            const user = await UserRepository.create(req.body);
            return success(res, user, 'Tạo user thành công');
        } catch (err) {
            return error(res, err.message);
        }
    }

    async update(req, res) {
        try {
            const user = await UserRepository.update(req.params.id, req.body);
            return success(res, user, 'Cập nhật user thành công');
        } catch (err) {
            return error(res, err.message);
        }
    }

    async destroy(req, res) {
        try {
            await UserRepository.delete(req.params.id);
            return success(res, null, 'Xóa user thành công');
        } catch (err) {
            return error(res, err.message);
        }
    }
}

module.exports = new UserController();
