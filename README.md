# Testing Flow

| Step               | Endpoint / Action              | Keterangan                    |
| ------------------ | ------------------------------ | ----------------------------- |
| Setup Admin User   | Manual                         | Create admin user in database |
| Login              | POST `/api/users/login`        | Get access token              |
| Create Slots       | POST `/api/slots/`             | Create parking slots          |
| Test Entry Flow 1  | GET `/api/slots/available`     | Check available slots         |
| Test Entry Flow 2  | GET `/api/slots/recommend`     | Get slot recommendation       |
| Test Entry Flow 3  | POST `/api/payments/entry`     | Record entry                  |
| Test Exit Flow 1   | POST `/api/payments/exit`      | Process exit & get QR         |
| Test Exit Flow 2   | POST `/api/payments/confirm`   | Confirm payment               |
| Admin Monitoring 1 | GET `/api/payments/history`    | View payment history          |
| Admin Monitoring 2 | GET `/api/payments/statistics` | View statistics               |
| Admin Monitoring 3 | GET `/api/payments/active`     | View active sessions          |


# Database Schema Notes

| Table    | Fields                                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Users    | id, username, password\_hash, email, role                                                                                       |
| Slots    | id, slot\_id, level, zone, status                                                                                               |
| Payments | id, payment\_id, user\_id, slot\_id, vehicle\_plate, vehicle\_type, entry\_time, exit\_time, duration, amount, status, qr\_code |
