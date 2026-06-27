from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker, declarative_base

# SQLite database (Render-safe relative path)
DATABASE_URL = "sqlite:///./gramnagar.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def init_db():
    """
    Initialize the database with tables, default data, and admin users.
    Safe to call multiple times (idempotent).
    """

    # 🔐 Prevent re-initialization on restart / redeploy
    inspector = inspect(engine)
    if inspector.has_table("users"):
        print("✅ Database already initialized, skipping init")
        return

    # Import models here to avoid circular imports
    from app.models import Organization, User
    from app.models.tax import TaxType
    from app.models.certificate import CertificateType
    from app.models.notification import Notification
    from passlib.context import CryptContext

    # Password hashing
    pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

    # Create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # ---------------- TAX TYPES ----------------
        if db.query(TaxType).count() == 0:
            tax_types = [
                TaxType(name="Water", description="Water tax/bill"),
                TaxType(name="Electricity", description="Electricity tax/bill"),
                TaxType(name="Property Tax", description="Property tax"),
                TaxType(name="Waste Management", description="Waste management fee"),
                TaxType(name="Street Lighting", description="Street lighting tax"),
                TaxType(name="Drainage", description="Drainage tax/fee"),
            ]
            db.add_all(tax_types)
            db.commit()
            print("✅ Default tax types created")

        # ---------------- CERTIFICATE TYPES ----------------
        if db.query(CertificateType).count() == 0:
            cert_types = [
                CertificateType(
                    name="birth_certificate",
                    display_name="Birth Certificate",
                    description="Certificate of birth issued by local government",
                    is_active=True,
                    required_fields='{"full_name":"Full Name","date_of_birth":"Date of Birth","place_of_birth":"Place of Birth","father_name":"Father\'s Name","mother_name":"Mother\'s Name","address":"Current Address"}'
                ),
                CertificateType(
                    name="death_certificate",
                    display_name="Death Certificate",
                    description="Certificate of death issued by local government",
                    is_active=True,
                    required_fields='{"deceased_full_name":"Full Name of Deceased","date_of_death":"Date of Death","place_of_death":"Place of Death","cause_of_death":"Cause of Death","informant_name":"Informant\'s Name","relationship_to_deceased":"Relationship to Deceased","address":"Address"}'
                ),
                CertificateType(
                    name="residence_certificate",
                    display_name="Residence Certificate",
                    description="Certificate proving residence in the area",
                    is_active=True,
                    required_fields='{"applicant_name":"Applicant\'s Name","father_name":"Father\'s Name","date_of_birth":"Date of Birth","address":"Current Address","period_of_residence":"Period of Residence","purpose":"Purpose"}'
                ),
                CertificateType(
                    name="income_certificate",
                    display_name="Income Certificate",
                    description="Certificate proving annual income",
                    is_active=True,
                    required_fields='{"applicant_name":"Applicant\'s Name","father_name":"Father\'s Name","date_of_birth":"Date of Birth","address":"Current Address","annual_income":"Annual Income","source_of_income":"Source of Income","purpose":"Purpose"}'
                ),
                CertificateType(
                    name="caste_certificate",
                    display_name="Caste Certificate",
                    description="Certificate proving caste category",
                    is_active=True,
                    required_fields='{"applicant_name":"Applicant\'s Name","father_name":"Father\'s Name","date_of_birth":"Date of Birth","address":"Current Address","caste":"Caste","sub_caste":"Sub-Caste","issuing_authority":"Issuing Authority","previous_certificate_number":"Previous Certificate Number","purpose":"Purpose"}'
                ),
                CertificateType(
                    name="marriage_certificate",
                    display_name="Marriage Certificate",
                    description="Certificate of marriage registration",
                    is_active=True,
                    required_fields='{"bride_name":"Bride\'s Name","bride_father_name":"Bride Father\'s Name","bride_mother_name":"Bride Mother\'s Name","groom_name":"Groom\'s Name","groom_father_name":"Groom Father\'s Name","groom_mother_name":"Groom Mother\'s Name","marriage_date":"Marriage Date","marriage_place":"Marriage Place","address":"Current Address"}'
                ),
                CertificateType(
                    name="bonafide_certificate",
                    display_name="Bonafide Certificate",
                    description="Certificate proving good conduct and character",
                    is_active=True,
                    required_fields='{"applicant_name":"Applicant\'s Name","father_name":"Father\'s Name","date_of_birth":"Date of Birth","address":"Current Address","occupation":"Occupation","purpose":"Purpose"}'
                ),
            ]

            db.add_all(cert_types)
            db.commit()
            print("✅ Default certificate types created")

        # ---------------- ORGANIZATIONS ----------------
        if db.query(Organization).count() == 0:
            db.add_all([
                Organization(
                    name="Gram Panchayat",
                    type="gram_panchayat",
                    description="Rural local self-government for village administration"
                ),
                Organization(
                    name="Mahanagar Palika",
                    type="mahanagar_palika",
                    description="Urban municipal corporation"
                )
            ])
            db.commit()
            print("✅ Default organizations created")

        # ---------------- ADMIN USERS ----------------
        if not db.query(User).filter_by(email="gramadmin@gmail.com").first():
            gp = db.query(Organization).filter_by(type="gram_panchayat").first()
            if gp:
                db.add(User(
                    name="Gram Panchayat Admin",
                    email="gramadmin@gmail.com",
                    password_hash=pwd.hash("@Admin123"),
                    role="admin",
                    organization_id=gp.id,
                    village="Admin",
                    area="Administration"
                ))
                db.commit()
                print("✅ Gram Panchayat Admin created")

        if not db.query(User).filter_by(email="mahanagaradmin@gmail.com").first():
            mp = db.query(Organization).filter_by(type="mahanagar_palika").first()
            if mp:
                db.add(User(
                    name="Mahanagar Palika Admin",
                    email="mahanagaradmin@gmail.com",
                    password_hash=pwd.hash("@Admin123"),
                    role="admin",
                    organization_id=mp.id,
                    village="Admin",
                    area="Administration"
                ))
                db.commit()
                print("✅ Mahanagar Palika Admin created")

    except Exception as e:
        db.rollback()
        print(f"❌ Database initialization error: {e}")

    finally:
        db.close()
