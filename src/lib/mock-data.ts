import type { Product } from "@/lib/types";

export const products: Product[] = [
    { id: "prod-001", code: "P-12345", name: "Project Phoenix", paNumber: "PA-2024-01", value: 1500000, currentStatus: "On Track" },
    { id: "prod-002", code: "P-67890", name: "Quantum Leap Initiative", paNumber: "PA-2024-02", value: 3200000, currentStatus: "Delayed" },
    { id: "prod-003", code: "P-13579", name: "DataStream Integration", paNumber: "PA-2024-03", value: 750000, currentStatus: "Completed" },
    { id: "prod-004", code: "P-24680", name: "NextGen UI Framework", paNumber: "PA-2024-04", value: 500000, currentStatus: "On Hold" },
    { id: "prod-005", code: "P-97531", name: "Cloud Migration Phase 2", paNumber: "PA-2024-05", value: 2100000, currentStatus: "On Track" },
];
