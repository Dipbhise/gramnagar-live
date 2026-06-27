from pydantic import BaseModel, EmailStr

class RegisterSchema(BaseModel):
    name: str
    email: EmailStr
    password: str
    organization_type: str
    village: str | None = ""
    area: str | None = ""
    role: str = "citizen"
