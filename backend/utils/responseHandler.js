function success(res, payload = {}, status = 200) {
  return res.status(status).json({ success: true, ...payload });
}

function error(res, message = 'An error occurred', status = 400) {
  return res.status(status).json({ success: false, error: message });
}

module.exports = { success, error };
