# ==========================================
# Demo Vehicle Seed Data — 100 Vehicles (₹20L+)
# ==========================================
# Run once to populate the database with demo inventory.
# Usage: python -m app.seed_vehicles
# ==========================================

import random
from app.database import SessionLocal
from app.models.vehicle import Vehicle

# High-quality car images from Unsplash
CAR_IMAGES = [
    "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1542362567-b07e54358753?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1525609004556-c46c93feb5cc?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&auto=format&fit=crop&q=80",
]

# ==========================================
# 100 Vehicles — Real Indian Market Prices (₹)
# All prices above ₹20,00,000 (20 Lakh)
# ==========================================
DEMO_VEHICLES = [
    # --- Maruti Suzuki ---
    {"make": "Maruti Suzuki", "model": "Grand Vitara Alpha+ Hybrid", "category": "SUV", "selling_price": 2450000},
    {"make": "Maruti Suzuki", "model": "Invicto Zeta+", "category": "MPV", "selling_price": 2870000},
    {"make": "Maruti Suzuki", "model": "Jimny Zeta AT", "category": "SUV", "selling_price": 2150000},
    {"make": "Maruti Suzuki", "model": "Grand Vitara Delta Hybrid", "category": "SUV", "selling_price": 2200000},
    # --- Hyundai ---
    {"make": "Hyundai", "model": "Tucson Signature AWD", "category": "SUV", "selling_price": 4270000},
    {"make": "Hyundai", "model": "Tucson Platinum DSL", "category": "SUV", "selling_price": 3550000},
    {"make": "Hyundai", "model": "Creta Facelift SX(O) Turbo", "category": "SUV", "selling_price": 2350000},
    {"make": "Hyundai", "model": "Creta Facelift SX Turbo DCT", "category": "SUV", "selling_price": 2180000},
    {"make": "Hyundai", "model": "Alcazar Signature DSL AT", "category": "SUV", "selling_price": 2900000},
    {"make": "Hyundai", "model": "Verna SX(O) Turbo DCT", "category": "Sedan", "selling_price": 2100000},
    {"make": "Hyundai", "model": "Ioniq 5 Long Range AWD", "category": "EV", "selling_price": 4595000},
    # --- Tata Motors ---
    {"make": "Tata", "model": "Harrier Fearless+ AT", "category": "SUV", "selling_price": 2850000},
    {"make": "Tata", "model": "Safari Accomplished+ AT DSL", "category": "SUV", "selling_price": 2980000},
    {"make": "Tata", "model": "Nexon EV Max LR Empowered+", "category": "EV", "selling_price": 2150000},
    {"make": "Tata", "model": "Curvv EV Empowered+ LR 55", "category": "EV", "selling_price": 2500000},
    {"make": "Tata", "model": "Harrier EV Fearless+ LR", "category": "EV", "selling_price": 3200000},
    {"make": "Tata", "model": "Safari Accomplished+ DSL 4x4", "category": "SUV", "selling_price": 3100000},
    # --- Mahindra ---
    {"make": "Mahindra", "model": "XUV700 AX7 L AWD AT DSL", "category": "SUV", "selling_price": 2870000},
    {"make": "Mahindra", "model": "XUV700 AX7 L AT Petrol", "category": "SUV", "selling_price": 2650000},
    {"make": "Mahindra", "model": "Thar Roxx MX5 AX7L 4WD AT", "category": "SUV", "selling_price": 2450000},
    {"make": "Mahindra", "model": "Scorpio N Z8L AT DSL 4WD", "category": "SUV", "selling_price": 2520000},
    {"make": "Mahindra", "model": "XUV 3XO AX7 L P AT", "category": "SUV", "selling_price": 2100000},
    {"make": "Mahindra", "model": "XEV 9e Pack Three LR 79", "category": "EV", "selling_price": 3100000},
    {"make": "Mahindra", "model": "BE 6e Pack Three LR 79", "category": "EV", "selling_price": 2700000},
    # --- Kia ---
    {"make": "Kia", "model": "Seltos X-Line 1.5 T-GDi DCT", "category": "SUV", "selling_price": 2290000},
    {"make": "Kia", "model": "Seltos GTX+ 1.5 T-GDi DCT", "category": "SUV", "selling_price": 2180000},
    {"make": "Kia", "model": "Sonet X-Line 1.0 T-GDi DCT", "category": "SUV", "selling_price": 2050000},
    {"make": "Kia", "model": "Carnival Limousine Plus", "category": "MPV", "selling_price": 6350000},
    {"make": "Kia", "model": "EV6 GT-Line AWD", "category": "EV", "selling_price": 6100000},
    {"make": "Kia", "model": "EV9 GT-Line AWD", "category": "EV", "selling_price": 7500000},
    # --- Toyota ---
    {"make": "Toyota", "model": "Fortuner Legender AT 4WD", "category": "SUV", "selling_price": 4980000},
    {"make": "Toyota", "model": "Fortuner GR Sport AT", "category": "SUV", "selling_price": 5350000},
    {"make": "Toyota", "model": "Innova Hycross ZX(O) Hybrid", "category": "MPV", "selling_price": 3050000},
    {"make": "Toyota", "model": "Innova Hycross VX Hybrid", "category": "MPV", "selling_price": 2780000},
    {"make": "Toyota", "model": "Camry Hybrid", "category": "Sedan", "selling_price": 4850000},
    {"make": "Toyota", "model": "Vellfire Executive Lounge", "category": "Luxury MPV", "selling_price": 12000000},
    {"make": "Toyota", "model": "Land Cruiser 300 LC300 GR-S", "category": "Luxury SUV", "selling_price": 23000000},
    # --- Honda ---
    {"make": "Honda", "model": "Elevate ZX CVT", "category": "SUV", "selling_price": 2050000},
    {"make": "Honda", "model": "City Hybrid e:HEV ZX", "category": "Sedan", "selling_price": 2100000},
    # --- MG (Morris Garages) ---
    {"make": "MG", "model": "Hector Savvy CVT Sharp Pro", "category": "SUV", "selling_price": 2350000},
    {"make": "MG", "model": "Gloster Savvy AT 4WD", "category": "SUV", "selling_price": 4050000},
    {"make": "MG", "model": "ZS EV Excite Pro LR", "category": "EV", "selling_price": 2450000},
    {"make": "MG", "model": "Windsor EV Essence 50kWh", "category": "EV", "selling_price": 2200000},
    # --- Skoda ---
    {"make": "Skoda", "model": "Superb Sportline 2.0 TSI AT", "category": "Sedan", "selling_price": 5400000},
    {"make": "Skoda", "model": "Kodiaq Sportline 2.0 TSI AT", "category": "SUV", "selling_price": 4800000},
    {"make": "Skoda", "model": "Kushaq Monte Carlo 1.5 TSI DSG", "category": "SUV", "selling_price": 2180000},
    # --- Volkswagen ---
    {"make": "Volkswagen", "model": "Taigun GT Plus 1.5 TSI DSG", "category": "SUV", "selling_price": 2070000},
    {"make": "Volkswagen", "model": "Virtus GT Plus 1.5 TSI DSG", "category": "Sedan", "selling_price": 2100000},
    {"make": "Volkswagen", "model": "Tiguan Elegance 2.0 TSI 4MOTION", "category": "SUV", "selling_price": 3650000},
    # --- Jeep ---
    {"make": "Jeep", "model": "Compass Model S 4x4 DSL AT", "category": "SUV", "selling_price": 3700000},
    {"make": "Jeep", "model": "Meridian Limited (O) 4x4 AT", "category": "SUV", "selling_price": 3900000},
    {"make": "Jeep", "model": "Wrangler Rubicon 2.0 AT", "category": "SUV", "selling_price": 6750000},
    {"make": "Jeep", "model": "Grand Cherokee Limited (O)", "category": "Luxury SUV", "selling_price": 8500000},
    # --- Citroen ---
    {"make": "Citroen", "model": "C3 Aircross Max AT", "category": "SUV", "selling_price": 2050000},
    {"make": "Citroen", "model": "C5 Aircross Feel DSL AT", "category": "SUV", "selling_price": 3400000},
    # --- BMW ---
    {"make": "BMW", "model": "2 Series Gran Coupe 220i M Sport", "category": "Sedan", "selling_price": 4650000},
    {"make": "BMW", "model": "3 Series 330Li M Sport", "category": "Sedan", "selling_price": 6550000},
    {"make": "BMW", "model": "5 Series 530Li M Sport", "category": "Sedan", "selling_price": 7900000},
    {"make": "BMW", "model": "X1 sDrive 20i M Sport", "category": "SUV", "selling_price": 5400000},
    {"make": "BMW", "model": "X3 xDrive 30i M Sport", "category": "SUV", "selling_price": 7400000},
    {"make": "BMW", "model": "X5 xDrive 40i M Sport", "category": "Luxury SUV", "selling_price": 10700000},
    {"make": "BMW", "model": "X7 xDrive 40i M Sport", "category": "Luxury SUV", "selling_price": 14500000},
    {"make": "BMW", "model": "iX xDrive 50 EV", "category": "EV", "selling_price": 12500000},
    {"make": "BMW", "model": "i7 xDrive 60 M Sport", "category": "EV", "selling_price": 19500000},
    # --- Mercedes-Benz ---
    {"make": "Mercedes-Benz", "model": "A-Class Limousine A200d AMG Line", "category": "Sedan", "selling_price": 5100000},
    {"make": "Mercedes-Benz", "model": "C-Class C300d AMG Line", "category": "Sedan", "selling_price": 6700000},
    {"make": "Mercedes-Benz", "model": "E-Class E200 Exclusive", "category": "Sedan", "selling_price": 8500000},
    {"make": "Mercedes-Benz", "model": "S-Class S450d 4MATIC", "category": "Luxury Sedan", "selling_price": 17500000},
    {"make": "Mercedes-Benz", "model": "GLA 220d 4MATIC AMG Line", "category": "SUV", "selling_price": 5600000},
    {"make": "Mercedes-Benz", "model": "GLC 300 4MATIC AMG Line", "category": "SUV", "selling_price": 7900000},
    {"make": "Mercedes-Benz", "model": "GLE 450d 4MATIC AMG Line", "category": "Luxury SUV", "selling_price": 11200000},
    {"make": "Mercedes-Benz", "model": "GLS 450d 4MATIC", "category": "Luxury SUV", "selling_price": 14000000},
    {"make": "Mercedes-Benz", "model": "EQS 580 4MATIC AMG Line", "category": "EV", "selling_price": 18500000},
    {"make": "Mercedes-Benz", "model": "AMG GT 63 S E Performance", "category": "Sports Car", "selling_price": 32500000},
    # --- Audi ---
    {"make": "Audi", "model": "A4 45 TFSI Technology", "category": "Sedan", "selling_price": 5350000},
    {"make": "Audi", "model": "A6 45 TFSI Technology", "category": "Sedan", "selling_price": 6800000},
    {"make": "Audi", "model": "A8 L 55 TFSI quattro", "category": "Luxury Sedan", "selling_price": 16500000},
    {"make": "Audi", "model": "Q3 Sportback 40 TFSI S-Line", "category": "SUV", "selling_price": 5500000},
    {"make": "Audi", "model": "Q5 45 TFSI Technology", "category": "SUV", "selling_price": 7200000},
    {"make": "Audi", "model": "Q7 55 TFSI Technology", "category": "Luxury SUV", "selling_price": 9800000},
    {"make": "Audi", "model": "e-tron GT quattro", "category": "EV", "selling_price": 18000000},
    {"make": "Audi", "model": "RS Q8 4.0 TFSI V8", "category": "Sports SUV", "selling_price": 24500000},
    # --- Volvo ---
    {"make": "Volvo", "model": "XC40 B4 Ultimate", "category": "SUV", "selling_price": 4800000},
    {"make": "Volvo", "model": "XC60 B5 Ultimate", "category": "SUV", "selling_price": 7200000},
    {"make": "Volvo", "model": "XC90 B6 Ultimate", "category": "Luxury SUV", "selling_price": 10500000},
    {"make": "Volvo", "model": "S90 B5 Ultimate", "category": "Sedan", "selling_price": 7000000},
    {"make": "Volvo", "model": "XC40 Recharge Pure Electric", "category": "EV", "selling_price": 5700000},
    # --- Land Rover ---
    {"make": "Land Rover", "model": "Defender 110 X-Dynamic HSE", "category": "SUV", "selling_price": 14500000},
    {"make": "Land Rover", "model": "Discovery Sport R-Dynamic SE", "category": "SUV", "selling_price": 7600000},
    {"make": "Land Rover", "model": "Range Rover Sport Dynamic HSE", "category": "Luxury SUV", "selling_price": 16000000},
    {"make": "Land Rover", "model": "Range Rover Autobiography LWB", "category": "Luxury SUV", "selling_price": 35000000},
    {"make": "Land Rover", "model": "Range Rover Velar R-Dynamic SE", "category": "SUV", "selling_price": 8900000},
    # --- Porsche ---
    {"make": "Porsche", "model": "Macan T", "category": "Sports SUV", "selling_price": 8300000},
    {"make": "Porsche", "model": "Cayenne Coupe", "category": "Luxury SUV", "selling_price": 14500000},
    {"make": "Porsche", "model": "Taycan 4S Cross Turismo", "category": "EV", "selling_price": 17000000},
    {"make": "Porsche", "model": "911 Carrera S", "category": "Sports Car", "selling_price": 21000000},
    # --- Lexus ---
    {"make": "Lexus", "model": "ES 300h Exquisite", "category": "Sedan", "selling_price": 6700000},
    {"make": "Lexus", "model": "NX 350h F-Sport", "category": "SUV", "selling_price": 7200000},
    {"make": "Lexus", "model": "RX 500h F-Sport", "category": "Luxury SUV", "selling_price": 11000000},
    {"make": "Lexus", "model": "LM 350h Ultra Luxury", "category": "Luxury MPV", "selling_price": 25000000},
    # --- BYD ---
    {"make": "BYD", "model": "Atto 3 Superior", "category": "EV", "selling_price": 3400000},
    {"make": "BYD", "model": "Seal Dynamic", "category": "EV", "selling_price": 4200000},
    {"make": "BYD", "model": "Seal Premium AWD", "category": "EV", "selling_price": 5200000},
    {"make": "BYD", "model": "eMAX 7 Premium", "category": "EV", "selling_price": 3100000},
]


def seed_vehicles():
    """Insert 100 demo vehicles into the database if not already present."""
    db = SessionLocal()
    try:
        existing = db.query(Vehicle).count()
        if existing >= 100:
            print(f"Database already has {existing} vehicles. Skipping seed.")
            return

        # Clear existing demo data for a clean seed
        db.query(Vehicle).delete()
        db.commit()

        for idx, v in enumerate(DEMO_VEHICLES):
            selling = v["selling_price"]
            purchase = round(selling * random.uniform(0.70, 0.82), 2)
            vehicle = Vehicle(
                make=v["make"],
                model=v["model"],
                category=v["category"],
                purchase_price=purchase,
                selling_price=selling,
                price=selling,
                quantity=random.randint(1, 15),
                image_url=CAR_IMAGES[idx % len(CAR_IMAGES)],
            )
            db.add(vehicle)

        db.commit()
        print(f"Successfully seeded {len(DEMO_VEHICLES)} demo vehicles!")
    finally:
        db.close()


if __name__ == "__main__":
    seed_vehicles()
