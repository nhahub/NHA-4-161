const Department = require('../models/Department');
const User = require('../models/User');

/**
 * Deactivate a department only when it has no active head and no active staff.
 * Throws ACTIVE_DEPENDENCIES_EXIST if either check fails — caller shows the
 * blocking confirmation modal so the admin can reassign first.
 */
async function deactivateDepartment(id) {
  const dept = await Department.findOne({ _id: id, isActive: true });
  if (!dept) { const e = new Error('Department not found'); e.status = 404; throw e; }

  if (dept.headUserId !== null) {
    const err = new Error('ACTIVE_DEPENDENCIES_EXIST');
    err.status = 409;
    err.detail = 'Department still has an active head. Reassign before deleting.';
    throw err;
  }

  const activeStaff = await User.countDocuments({ departmentId: id, isActive: true });
  if (activeStaff > 0) {
    const err = new Error('ACTIVE_DEPENDENCIES_EXIST');
    err.status = 409;
    err.detail = `${activeStaff} active staff member(s) still assigned. Reassign before deleting.`;
    throw err;
  }

  await Department.updateOne({ _id: id }, { isActive: false });
}

async function createDepartment(name) {
  const dept = new Department({ name });
  await dept.save();
  return dept;
}

async function listDepartments() {
  return Department.find({ isActive: true }, 'name headUserId createdAt').sort({ name: 1 });
}

/**
 * Reassign department head — new head must be an active user.
 */
async function reassignHead(deptId, newHeadUserId) {
  if (newHeadUserId) {
    const head = await User.findOne({ _id: newHeadUserId, isActive: true, role: 'doctor' });
    if (!head) {
      const err = new Error('Target user is not an active doctor');
      err.status = 400;
      throw err;
    }
  }
  const dept = await Department.findOneAndUpdate(
    { _id: deptId, isActive: true },
    { headUserId: newHeadUserId || null },
    { new: true }
  );
  if (!dept) { const e = new Error('Department not found'); e.status = 404; throw e; }
  return dept;
}

module.exports = { deactivateDepartment, createDepartment, listDepartments, reassignHead };
