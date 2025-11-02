exports.success = (res, data, message = 'Thành công') => {
    return res.json({ status: true, message, data });
};

exports.error = (res, message = 'Lỗi', code = 500) => {
    return res.status(code).json({ status: false, message });
};
