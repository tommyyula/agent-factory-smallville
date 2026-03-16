// Core Entity Types for Agent Factory Smallville
export var AgentStatus;
(function (AgentStatus) {
    AgentStatus["IDLE"] = "idle";
    AgentStatus["THINKING"] = "thinking";
    AgentStatus["EXECUTING"] = "executing";
    AgentStatus["COMMUNICATING"] = "communicating";
    AgentStatus["ERROR"] = "error";
    AgentStatus["SLEEPING"] = "sleeping";
    AgentStatus["OFFLINE"] = "offline";
})(AgentStatus || (AgentStatus = {}));
export var AgentType;
(function (AgentType) {
    AgentType["WAREHOUSE"] = "warehouse";
    AgentType["TRANSPORTATION"] = "transportation";
    AgentType["CUSTOMER_SERVICE"] = "customer_service";
    AgentType["DATA_ANALYST"] = "data_analyst";
    AgentType["DEVELOPER"] = "developer";
    AgentType["QUALITY"] = "quality";
    AgentType["PLANNING"] = "planning";
    AgentType["COORDINATOR"] = "coordinator";
})(AgentType || (AgentType = {}));
export var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "pending";
    TaskStatus["ASSIGNED"] = "assigned";
    TaskStatus["IN_PROGRESS"] = "in_progress";
    TaskStatus["COMPLETED"] = "completed";
    TaskStatus["FAILED"] = "failed";
    TaskStatus["CANCELLED"] = "cancelled";
})(TaskStatus || (TaskStatus = {}));
export var TaskType;
(function (TaskType) {
    TaskType["INVENTORY_CHECK"] = "inventory_check";
    TaskType["ROUTE_OPTIMIZATION"] = "route_optimization";
    TaskType["CUSTOMER_INQUIRY"] = "customer_inquiry";
    TaskType["DATA_ANALYSIS"] = "data_analysis";
    TaskType["CODE_REVIEW"] = "code_review";
    TaskType["QUALITY_CONTROL"] = "quality_control";
    TaskType["TEAM_COORDINATION"] = "team_coordination";
    TaskType["REPORT_GENERATION"] = "report_generation";
})(TaskType || (TaskType = {}));
export var Priority;
(function (Priority) {
    Priority[Priority["LOW"] = 1] = "LOW";
    Priority[Priority["NORMAL"] = 2] = "NORMAL";
    Priority[Priority["HIGH"] = 3] = "HIGH";
    Priority[Priority["CRITICAL"] = 4] = "CRITICAL";
})(Priority || (Priority = {}));
export var MemoryType;
(function (MemoryType) {
    MemoryType["OBSERVATION"] = "observation";
    MemoryType["REFLECTION"] = "reflection";
    MemoryType["PLAN"] = "plan";
})(MemoryType || (MemoryType = {}));
export var MessageType;
(function (MessageType) {
    MessageType["DIRECT"] = "direct";
    MessageType["BROADCAST"] = "broadcast";
    MessageType["REQUEST"] = "request";
    MessageType["RESPONSE"] = "response";
})(MessageType || (MessageType = {}));
export var ZoneType;
(function (ZoneType) {
    ZoneType["WAREHOUSE"] = "warehouse";
    ZoneType["TRANSPORT"] = "transport";
    ZoneType["CUSTOMER_SERVICE"] = "customer_service";
    ZoneType["DATA_CENTER"] = "data_center";
    ZoneType["DEVELOPMENT"] = "development";
    ZoneType["QUALITY"] = "quality";
    ZoneType["PLANNING"] = "planning";
    ZoneType["COMMON_AREA"] = "common_area";
    ZoneType["REST_AREA"] = "rest_area";
})(ZoneType || (ZoneType = {}));
export var BuildingType;
(function (BuildingType) {
    BuildingType["HOUSE"] = "house";
    BuildingType["APARTMENT"] = "apartment";
    BuildingType["WAREHOUSE"] = "warehouse";
    BuildingType["OFFICE"] = "office";
    BuildingType["DATA_CENTER"] = "data_center";
    BuildingType["TRANSPORT_HUB"] = "transport_hub";
    BuildingType["MEETING_ROOM"] = "meeting_room";
    BuildingType["BREAK_ROOM"] = "break_room";
})(BuildingType || (BuildingType = {}));
