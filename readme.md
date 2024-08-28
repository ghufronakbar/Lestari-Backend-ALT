# API Documentation

## API ADMIN

### Login
**POST /v1/web/login**

**Request Body:**
- `email`: string
- `password`: string

---

### Get Animals
**GET /v1/web/animals**

**Request Query:**
- `page`: integer
- `search`: string
- `date_start`: string (optional)
- `date_end`: string (optional)

---

### Get Animal by ID
**GET /v1/web/animal/:id**

_No additional parameters required._

---

### Edit Animal by ID
**PUT /v1/web/animal/edit/:id**

**Request Body:**
- `local_name`: string
- `latin_name`: string
- `habitat`: string
- `description`: string
- `city`: string
- `longitude`: float
- `latitude`: float
- `image`: string
- `amount`: integer

---

### Delete Animal by ID
**DELETE /v1/web/animal/delete/:id**

_No additional parameters required._

---

### Get Request Accounts
**GET /v1/web/request/accounts**

**Request Query:**
- `page`: integer
- `search`: string
- `approve`: integer (0/1)
- `date_start`: string (optional)
- `date_end`: string (optional)

---

### Get Request Account by ID
**GET /v1/web/request/account/:id**

_No additional parameters required._

---

### Approve Request Account
**PUT /v1/web/request/account/approve/:id**

**Request Body:**
- `approve`: integer (0/1)

---

### Get Request Datas
**GET /v1/web/request/datas**

**Request Query:**
- `page`: integer
- `search`: string
- `date_start`: string (optional)
- `date_end`: string (optional)

---

### Get Request Data by ID
**GET /v1/web/request/data/:id**

_No additional parameters required._

---

### Approve Request Data
**PUT /v1/web/request/data/approve/:id**

**Request Body:**
- `approve`: integer (0/1)

---

### Send Approved Request Data
**POST /v1/web/request/data/approve/send**

**Request Body:**
- `local_name`: integer (0/1)
- `latin_name`: integer (0/1)
- `habitat`: integer (0/1)
- `description`: integer (0/1)
- `city`: integer (0/1)
- `longitude`: integer (0/1)
- `latitude`: integer (0/1)
- `image`: integer (0/1)
- `amount`: integer (0/1)
- `date_start`: string
- `date_end`: string
- `id_request_data`: integer

---

### Get History of Request Data
**GET /v1/web/history/request/data**

**Request Query:**
- `page`: integer
- `search`: string
- `date_start`: string (optional)
- `date_end`: string (optional)

---

### Get History of Request Data by ID
**GET /v1/web/history/request/data/:id**

_No additional parameters required._

---

### Get Users
**GET /v1/web/users**

**Request Query:**
- `page`: integer
- `search`: string
- `status`: integer (0/1)

---

### Get User by ID
**GET /v1/web/user/:id**

_No additional parameters required._

---

### Suspend User
**PUT /v1/web/user/suspend**

**Request Body:**
- `id`: integer
- `status`: integer (0/1)

---

### Create Admin Account
**POST /v1/web/create-account**

**Request Body:**
- `name`: string
- `email`: string

---

### Verify Account
**GET /v1/web/verify-account/:token**

_No additional parameters required._

---

### Reset Password
**POST /v1/web/reset-password**

**Request Body:**
- `email`: string

---

### Get Admins
**GET /v1/web/admins**

**Request Query:**
- `page`: integer
- `search`: string
- `date_start`: string (optional)
- `date_end`: string (optional)

---

### Delete Admin
**DELETE /v1/web/admin/delete/:id_admin**

_No additional parameters required._

---

### Edit Admin
**PUT /v1/web/admin/edit**

**Request Decoded:**
- `id_admin`: integer

**Request Body:**
- `name`: string
- `password`: string
- `confirmation_password`: string

---

### Admin Profile
**GET /v1/web/admin/profile**

**Request Decoded:**
- `id_admin`: integer

---

### Get All Suggestions
**GET /v1/web/suggestions**

**Request Query:**
- `page`: integer
- `search`: string

---

### Create Suggestion
**POST /v1/web/suggestions**

**Request Body:**
- `local_name`: string
- `latin_name`: string

---

### Edit Suggestion
**PUT /v1/web/suggestions/:id**

**Request Body:**
- `local_name`: string
- `latin_name`: string

---

### Delete Suggestion
**DELETE /v1/web/suggestions/:id**

_No additional parameters required._

---

## API USER

### User Login
**POST /v1/mob/user/login**

**Request Body:**
- `email`: string
- `password`: string

---

### Get Editable Animals
**GET /v1/mob/animals/editable**

**Request Decoded:**
- `id_user`: integer

---

### Check User
**GET /v1/mob/user/check**

**Request Decoded:**
- `id_user`: integer

---

### Get Animal by ID for User
**GET /v1/mob/animal/:id_animal**

**Request Decoded:**
- `id_user`: integer

---

### Add Animal
**POST /v1/mob/animal/add**

**Request Decoded:**
- `id_user`: integer

**Request Body:**
- `local_name`: string
- `latin_name`: string
- `habitat`: string
- `description`: string
- `city`: string
- `longitude`: float
- `latitude`: float
- `image`: string
- `amount`: integer

---

### Edit Animal by ID (without image)
**PUT /v1/mob/animal/editable/edit/:id_animal**

**Request Decoded:**
- `id_user`: integer

**Request Body:**
- `local_name`: string
- `latin_name`: string
- `habitat`: string
- `description`: string
- `city`: string
- `longitude`: float
- `latitude`: float
- `image`: string
- `amount`: integer

---

### Delete Animal by ID for User
**DELETE /v1/mob/animal/editable/delete/:id_animal**

**Request Decoded:**
- `id_user`: integer

---

### Upload Animal Image
**POST /v1/mob/animal/upload/image**

**Request Decoded:**
- `id_user`: integer

**Request Body:**
- `image`: file (multipart/form-data)

---

### Delete Animal Image by URL
**DELETE /v1/mob/animal/delete/image**

**Request Decoded:**
- `id_user`: integer

**Request Body:**
- `imageUrl`: string

---

### Get Animal History
**GET /v1/mob/animals/history**

**Request Decoded:**
- `id_user`: integer

---

### Get Animal History by ID
**GET /v1/mob/animal/history/:id_animal**

**Request Decoded:**
- `id_user`: integer

---

### Get User Account
**GET /v1/mob/user/account**

**Request Decoded:**
- `id_user`: integer

---

### Edit User Account Name
**PUT /v1/mob/user/account/edit/name**

**Request Decoded:**
- `id_user`: integer

**Request Body:**
- `name`: string

---

### Edit User Account Picture
**PUT /v1/mob/user/account/edit/picture**

**Request Decoded:**
- `id_user`: integer

**Request Body:**
- `image`: file (multipart/form-data)

---

### Edit User Account Password
**PUT /v1/mob/user/account/edit/password**

**Request Decoded:**
- `id_user`: integer

**Request Body:**
- `old_password`: string
- `new_password`: string

---

### Get Request Data for User
**GET /v1/mob/user/request-datas**

**Request Decoded:**
- `id_user`: integer

---

### Get Request Data by ID for User
**GET /v1/mob/user/request-data/:id_request_data**

**Request Decoded:**
- `id_user`: integer

---

### Add Request Data
**POST /v1/mob/user/request-data/add**

**Request Decoded:**
- `id_user`: integer

---

### Upload Attachment for Request Data
**POST /v1/mob/user/request-data/add/attachment**

**Request Decoded:**
- `id_user`: integer

**Request Body:**
- `image`: file (multipart/form-data)

---

### User Register
**POST /v1/mob/user/register**

**Request Body:**
- `name`: string
- `email`: string
- `phone`: string
- `profession`: string
- `instances`: string
- `kepentingan`: string
- `deskripsi`: string

---

### Check User Password
**POST /v1/mob/user/check-password**

**Request Decoded:**
- `id_user`: integer

**Request Body:**
- `password`: string

---

### Set New Password
**PUT /v1/mob/user/new_password**

**Request Decoded:**
- `id_user`: integer

**Request Body:**
- `new_password`: string

---

### Forget Password
**POST /v1/web/user/forgot-password**

**Request Body:**
- `email`: string
- `otp`: string

---

### Guest Request Data
**POST /v1/web/user/request-data**

**Request Body:**
- `name`: string
- `email`: string
- `profession`: string
- `instances`: string
- `subject`: string
- `body`: string
- `attachment`: file (optional)

---

### Upload Attachment for Guest Request Data
**POST /v1/web/user/request-data/attachment**

**Request Body:**
- `image`: file (multipart/form-data)

---

### Show Suggestions
**GET /v1/mob/user/suggestion**

**Request Query:**
- `q`: string
