const mongoose = require('mongoose');

class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    /** =============================
     * 🔍 CRUD cơ bản
     * ============================= */
    async all(limit = 100, sort = { createdAt: -1 }) {
        return await this.model.find().limit(limit).sort(sort);
    }

    async findById(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        return await this.model.findById(id);
    }

    async create(data) {
        const model = new this.model(data);
        return await model.save();
    }

    async update(id, data) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        return await this.model.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id) {
        if (!mongoose.Types.ObjectId.isValid(id)) return null;
        return await this.model.findByIdAndDelete(id);
    }

    /** =============================
     * ⚙️ Build query động (Laravel style)
     * ============================= */
    _convertOperator(op) {
        switch (op) {
            case '=': return null;
            case '!=': return '$ne';
            case '>': return '$gt';
            case '>=': return '$gte';
            case '<': return '$lt';
            case '<=': return '$lte';
            default: return null;
        }
    }

    _buildSingleCondition(cond) {
        const op = cond.operation || '=';
        const field = cond.key;
        const value = cond.value;

        switch (op) {
            case 'like': return { [field]: { $regex: value, $options: 'i' } };
            case 'in': return { [field]: { $in: value } };
            case 'notIn': return { [field]: { $nin: value } };
            case 'null': return { [field]: null };
            case 'notNull': return { [field]: { $ne: null } };
            case 'between': return { [field]: { $gte: value[0], $lte: value[1] } };
            case 'expr': return { $expr: value };
            default:
                const mongoOp = this._convertOperator(op);
                return { [field]: mongoOp ? { [mongoOp]: value } : value };
        }
    }

    _appendCondition(query, field, value, boolean = 'and') {
        if (boolean === 'or') {
            query.$or = query.$or || [];
            query.$or.push(field ? { [field]: value } : value);
        } else {
            query.$and = query.$and || [];
            query.$and.push(field ? { [field]: value } : value);
        }
        return query;
    }

    _appendGroupCondition(query, operator, conditions, boolean = 'and') {
        const group = { [operator]: conditions };
        if (boolean === 'or') {
            query.$or = query.$or || [];
            query.$or.push(group);
        } else {
            query.$and = query.$and || [];
            query.$and.push(group);
        }
        return query;
    }

    applyCondition(query, condition, boolean = 'and') {
        const operation = condition.operation || '=';
        switch (operation) {
            case 'like': {
                const regex = new RegExp(condition.value, 'i');
                return this._appendCondition(query, condition.key, { $regex: regex }, boolean);
            }
            case 'in':
                return this._appendCondition(query, condition.key, { $in: condition.value }, boolean);
            case 'notIn':
                return this._appendCondition(query, condition.key, { $nin: condition.value }, boolean);
            case 'null':
                return this._appendCondition(query, condition.key, null, boolean);
            case 'notNull':
                return this._appendCondition(query, condition.key, { $ne: null }, boolean);
            case 'between':
                return this._appendCondition(query, condition.key, { $gte: condition.value[0], $lte: condition.value[1] }, boolean);
            case 'raw':
                return this._appendCondition(query, null, condition.value, boolean);
            case 'expr':
                return this._appendCondition(query, '$expr', condition.value, boolean);
            case 'and': {
                const andGroup = condition.conditions.map((cond) => this._buildSingleCondition(cond));
                return this._appendGroupCondition(query, '$and', andGroup, boolean);
            }
            case 'orWhere': {
                const orGroup = condition.conditions.map((cond) => this._buildSingleCondition(cond));
                return this._appendGroupCondition(query, '$or', orGroup, boolean);
            }
            default:
                const mongoOp = this._convertOperator(operation);
                return this._appendCondition(query, condition.key, mongoOp ? { [mongoOp]: condition.value } : condition.value, boolean);
        }
    }

    /** =============================
     * 🔎 Search nâng cao theo điều kiện
     * ============================= */
    async search(conditions = [], options = {}) {
        let query = {};
        for (const cond of conditions) {
            query = this.applyCondition(query, cond);
        }
        console.log(query);

        const limit = options.limit || 20;
        const page = options.page || 1;
        const skip = (page - 1) * limit;
        const sort = options.sort || { createdAt: -1 };

        const [items, total] = await Promise.all([
            this.model.find(query).sort(sort).skip(skip).limit(limit),
            this.model.countDocuments(query)
        ]);

        return {
            total,
            page,
            limit,
            items,
            last_page: Math.ceil(total / limit)
        };
    }
}

module.exports = BaseRepository;
