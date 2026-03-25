const sequelize = require('../config/database');
const User = require('./User');
const AuditLog = require('./AuditLog');
const Category = require('./Category');
const Transaction = require('./Transaction');
const Product = require('./Product');
const StockMovement = require('./StockMovement');
const WorkOrder = require('./WorkOrder');
const WorkOrderAttachment = require('./WorkOrderAttachment');
const WorkOrderHistory = require('./WorkOrderHistory');
const CompanySettings = require('./CompanySettings');
const Employee = require('./Employee');
const Attendance = require('./Attendance');
const Payroll = require('./Payroll');
const LeaveRequest = require('./LeaveRequest');
const PerformanceReview = require('./PerformanceReview');
const Provider = require('./Provider');
const PurchaseRequest = require('./PurchaseRequest');
const PurchaseOrder = require('./PurchaseOrder');

// ── Associations ──

// Transaction → Category
Transaction.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });
Category.hasMany(Transaction, { foreignKey: 'category_id' });

// Transaction → User
Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Transaction, { foreignKey: 'user_id' });

// StockMovement → Product
StockMovement.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(StockMovement, { foreignKey: 'product_id', as: 'movements' });

// StockMovement → User
StockMovement.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// WorkOrder → User (assigned_to)
WorkOrder.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });
// WorkOrder → User (created_by)
WorkOrder.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// WorkOrder → Attachments
WorkOrder.hasMany(WorkOrderAttachment, { foreignKey: 'work_order_id', as: 'attachments' });
WorkOrderAttachment.belongsTo(WorkOrder, { foreignKey: 'work_order_id' });

// WorkOrder → History
WorkOrder.hasMany(WorkOrderHistory, { foreignKey: 'work_order_id', as: 'history' });
WorkOrderHistory.belongsTo(WorkOrder, { foreignKey: 'work_order_id' });

// WorkOrderHistory → User
WorkOrderHistory.belongsTo(User, { foreignKey: 'changed_by', as: 'user' });

// WorkOrderAttachment → User
WorkOrderAttachment.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

// AuditLog → User
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// --- HR Associations ---

// Employee → Attendance
Employee.hasMany(Attendance, { foreignKey: 'employeeId', as: 'attendances' });
Attendance.belongsTo(Employee, { foreignKey: 'employeeId' });

// Employee → Payroll
Employee.hasMany(Payroll, { foreignKey: 'employeeId', as: 'payrolls' });
Payroll.belongsTo(Employee, { foreignKey: 'employeeId' });

// Employee → LeaveRequest
Employee.hasMany(LeaveRequest, { foreignKey: 'employeeId', as: 'leaves' });
LeaveRequest.belongsTo(Employee, { foreignKey: 'employeeId' });

// Employee → PerformanceReview
Employee.hasMany(PerformanceReview, { foreignKey: 'employeeId', as: 'reviews' });
PerformanceReview.belongsTo(Employee, { foreignKey: 'employeeId' });

// --- Purchasing Associations ---

PurchaseRequest.belongsTo(User, { foreignKey: 'requestedBy', as: 'requester' });
User.hasMany(PurchaseRequest, { foreignKey: 'requestedBy', as: 'purchaseRequests' });

PurchaseOrder.belongsTo(PurchaseRequest, { foreignKey: 'requestId', as: 'request' });
PurchaseRequest.hasOne(PurchaseOrder, { foreignKey: 'requestId', as: 'order' });

PurchaseOrder.belongsTo(Provider, { foreignKey: 'providerId', as: 'provider' });
Provider.hasMany(PurchaseOrder, { foreignKey: 'providerId', as: 'orders' });

// WorkOrder -> PurchaseRequest
PurchaseRequest.belongsTo(WorkOrder, { foreignKey: 'work_order_id', as: 'workOrder' });
WorkOrder.hasMany(PurchaseRequest, { foreignKey: 'work_order_id', as: 'purchaseRequests' });

module.exports = {
  sequelize,
  User,
  AuditLog,
  Category,
  Transaction,
  Product,
  StockMovement,
  WorkOrder,
  WorkOrderAttachment,
  WorkOrderHistory,
  CompanySettings,
  Employee,
  Attendance,
  Payroll,
  LeaveRequest,
  PerformanceReview,
  Provider,
  PurchaseRequest,
  PurchaseOrder
};
