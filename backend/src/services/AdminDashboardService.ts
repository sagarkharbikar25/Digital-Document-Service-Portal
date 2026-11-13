import { query } from '../lib/db.js';

export class AdminDashboardService {
  public async getStats(department?: string) {
    let whereClause = '';
    const params: any[] = [];
    if (department && department !== 'all' && department !== 'Institution') {
      params.push(`%${department}%`);
      whereClause = ` WHERE (branch ILIKE $1) `;
    }

    const totalRes = await query(`SELECT COUNT(*)::int as total FROM applications ${whereClause}`, params);
    const pendingClerkRes = await query(`SELECT COUNT(*)::int as count FROM applications ${whereClause ? whereClause + ' AND' : 'WHERE'} status IN ('pending', 'pending_clerk')`, params);
    const pendingHodRes = await query(`SELECT COUNT(*)::int as count FROM applications ${whereClause ? whereClause + ' AND' : 'WHERE'} (status = 'pending_hod' OR clerk_status = 'approved')`, params);
    const pendingPrincipalRes = await query(`SELECT COUNT(*)::int as count FROM applications ${whereClause ? whereClause + ' AND' : 'WHERE'} status = 'pending_principal'`, params);
    const issuedRes = await query(`SELECT COUNT(*)::int as count FROM applications ${whereClause ? whereClause + ' AND' : 'WHERE'} status = 'issued'`, params);
    const rejectedRes = await query(`SELECT COUNT(*)::int as count FROM applications ${whereClause ? whereClause + ' AND' : 'WHERE'} status = 'rejected'`, params);

    return {
      total_applications: totalRes.rows[0]?.total || 0,
      pending_clerk: pendingClerkRes.rows[0]?.count || 0,
      pending_hod: pendingHodRes.rows[0]?.count || 0,
      pending_principal: pendingPrincipalRes.rows[0]?.count || 0,
      issued: issuedRes.rows[0]?.count || 0,
      rejected: rejectedRes.rows[0]?.count || 0,
      department: department || 'Institution-wide'
    };
  }
}

export const adminDashboardService = new AdminDashboardService();

