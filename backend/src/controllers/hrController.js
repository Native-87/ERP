const { Employee, Attendance, Payroll, LeaveRequest, PerformanceReview } = require('../models');

// Empleados
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const employee = await Employee.create(req.body);
    res.status(201).json(employee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByPk(id);
    if (!employee) return res.status(404).json({ error: 'Empleado no encontrado' });
    await employee.update(req.body);
    res.json(employee);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Asistencias
exports.getAttendances = async (req, res) => {
  try {
    const attendances = await Attendance.findAll({ include: [{ model: Employee, attributes: ['firstName', 'lastName'] }] });
    res.json(attendances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.create(req.body);
    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Licencias
exports.getLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.findAll({ include: [{ model: Employee, attributes: ['firstName', 'lastName'] }] });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createLeave = async (req, res) => {
  try {
    const leave = await LeaveRequest.create(req.body);
    res.status(201).json(leave);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Nominas (Payroll)
exports.getPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.findAll({ include: [{ model: Employee, attributes: ['firstName', 'lastName'] }] });
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
