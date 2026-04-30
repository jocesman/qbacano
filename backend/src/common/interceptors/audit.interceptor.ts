import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.url;
    const userId = req.user?.id;

    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const entity = this.extractEntity(url);
    const recordId = req.params?.id || req.body?.id;

    return next.handle().pipe(
      tap(async (result) => {
        try {
          await this.prisma.auditLog.create({
            data: {
              action: this.mapAction(method),
              entity,
              recordId: recordId || result?.id || 'unknown',
              userId,
              changes: { before: req.body, after: result },
            },
          });
        } catch (e) {
          console.error('Error writing audit log:', e);
        }
      })
    );
  }

  private extractEntity(url: string): string {
    const parts = url.split('/').filter(p => p && !p.includes('?'));
    return parts[0]?.toUpperCase() || 'UNKNOWN';
  }

  private mapAction(method: string): string {
    const map: Record<string, string> = {
      POST: 'CREATE', PATCH: 'UPDATE', PUT: 'UPDATE', DELETE: 'DELETE'
    };
    return map[method] || 'READ';
  }
}
