from pydantic import BaseModel, Field, field_validator

CATEGORIES = ("Plumbing", "Electrical", "AC", "Other")
PRIORITIES = ("Low", "Medium", "High")
STATUSES = ("Pending", "In Progress", "Resolved")


class CreateRequestSchema(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=4000)
    category: str
    priority: str
    unit_number: str = Field(min_length=1, max_length=50)

    @field_validator("category")
    @classmethod
    def validate_category(cls, v):
        if v not in CATEGORIES:
            raise ValueError(f"category must be one of {CATEGORIES}")
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v):
        if v not in PRIORITIES:
            raise ValueError(f"priority must be one of {PRIORITIES}")
        return v


class UpdateRequestSchema(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1, max_length=4000)
    category: str
    priority: str
    unit_number: str = Field(min_length=1, max_length=50)

    @field_validator("category")
    @classmethod
    def validate_category(cls, v):
        if v not in CATEGORIES:
            raise ValueError(f"category must be one of {CATEGORIES}")
        return v

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v):
        if v not in PRIORITIES:
            raise ValueError(f"priority must be one of {PRIORITIES}")
        return v


class StatusUpdateSchema(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        if v not in STATUSES:
            raise ValueError(f"status must be one of {STATUSES}")
        return v


class PriorityUpdateSchema(BaseModel):
    priority: str

    @field_validator("priority")
    @classmethod
    def validate_priority(cls, v):
        if v not in PRIORITIES:
            raise ValueError(f"priority must be one of {PRIORITIES}")
        return v
