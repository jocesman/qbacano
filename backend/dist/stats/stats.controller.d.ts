import { StatsService } from './stats.service';
export declare class StatsController {
    private readonly statsService;
    constructor(statsService: StatsService);
    getDailySales(): Promise<unknown>;
    getTopProducts(): Promise<unknown>;
    getMonthlyRevenue(): Promise<unknown>;
}
