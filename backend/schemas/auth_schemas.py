from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)
    role: str
    unit_number: str | None = Field(default=None, max_length=50)

    @field_validator("role")
    @classmethod
    def validate_role(cls, v):
        if v not in ("tenant", "manager"):
            raise ValueError("role must be 'tenant' or 'manager'")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)
