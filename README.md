# Requirements
- [Docker](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/)
- [DBeaver](https://dbeaver.io/) 
- [Python](https://www.python.org/) 
- [Node.js](https://nodejs.org/en/download)
- [Postman](https://www.postman.com/) 

## Instalasi & Setup
1. **Clone the Repository**
    - bebas git clone aja dimana aja wkwkwk, nanti copas FE kamu
        ```sh
        git clone https://github.com/Alizaaaja4/CQUET_Parking.git
        cd CQUET_Parking
        ```

2. **Set Up Backend**
   - Navigate to the `backend` folder:
     ```sh
     cd backend
     ```
   - Create a virtual environment and activate it:
     ```sh
     python -m venv venv
     source venv/bin/activate  # On Windows: venv\Scripts\activate
     ```
   - Install dependencies:
     ```sh
     pip install -r requirements.txt
     ```
  
3. **Build and Run Using Docker Compose**
    - Navigate back to the root directory:
        ```sh
        cd ..
        ```
   - Build and start the services:
     ```sh
     docker compose up --build -d
     ```
    - Cek Semua Container Berjalan
        ```sh
        docker compose ps
        ```
   - Cek Log Backend (Debugging)
     ```sh
     docker compose logs -f backend
     ```
    - Migrasi Dummy Data ke DBeaver
        ```sh
        docker compose exec backend bash
        python init_db.py
        ```


## API Endpoints
[Dokumentasi ERD](https://dbdiagram.io/d/687261dbf413ba35088c192d) & [Dokumentasi API](https://martian-firefly-918270.postman.co/workspace/My-Workspace~fcfe7932-4ced-470f-8370-32b656cbeaf9/collection/32756734-e6d5c3b1-4dcf-4835-abb6-336fc0fd2742?action=share&creator=32756734) 
### Testing Flow

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


### Database Schema Notes

| Table    | Fields                                                                                                                          |
| -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Users    | id, username, password\_hash, email, role                                                                                       |
| Slots    | id, slot\_id, level, zone, status                                                                                               |
| Payments | id, payment\_id, user\_id, slot\_id, vehicle\_plate, vehicle\_type, entry\_time, exit\_time, duration, amount, status, qr\_code |
