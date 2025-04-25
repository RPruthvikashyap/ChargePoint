from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Stored password hash from database
stored_password_hash = "$2b$12$HRMjzdWr4gRutTbUWS/c0u66qAyp1SwaYV9PsXlpZSSm2vAfECkz2"

# Password entered by user
entered_password = "123456"

# Verify password
is_valid = pwd_context.verify(entered_password, stored_password_hash)

print("Password Match:", is_valid)