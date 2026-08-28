/**
 * StayNear - Student Accommodation Database
 * Centrally stores all verified properties near Dev Bhoomi Uttarakhand University (DBUU), Naugaon, Dehradun.
 * This file serves as a mock local database layer that can be easily connected to an API or database in the future.
 */

const PROPERTIES = [
  {
    id: 1,
    name: "Comfort Nest PG",
    type: "PG",
    price: 6500,
    rating: 4.6,
    location: "Naugaon, Dehradun",
    distance: "0.6 km from DBUU",
    description: "A premium student accommodation offering spacious double sharing rooms. Comfort Nest is located in a quiet neighborhood, ensuring a study-friendly environment with home-like food, top-tier high-speed WiFi, laundry services, and 24/7 security.",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80"
    ],
    facilities: ["WiFi", "Food", "Laundry", "Security", "Furnished"],
    ownerPhone: "+919876543210",
    occupancy: "Double Sharing",
    availableRooms: 3,
    deposit: 6500
  },
  {
    id: 2,
    name: "Student Haven Hostels",
    type: "Hostel",
    price: 7500,
    rating: 4.8,
    location: "Bidholi Road, Dehradun",
    distance: "1.2 km from DBUU",
    description: "Modern student hostel with excellent recreational spaces. Features single and double rooms, dynamic common room with indoor games, cafeteria, and private study zones. Fully furnished rooms with attached bathroom.",
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80"
    ],
    facilities: ["WiFi", "Food", "Laundry", "Security", "Attached bathroom", "Parking", "Furnished"],
    ownerPhone: "+919988776655",
    occupancy: "Single & Double",
    availableRooms: 5,
    deposit: 10000
  },
  {
    id: 3,
    name: "Campus Residency",
    type: "Private Room",
    price: 5500,
    rating: 4.4,
    location: "Naugaon, Dehradun",
    distance: "0.4 km from DBUU",
    description: "Highly budget-friendly independent rooms for students who value privacy. Located within walking distance of the university. Comes with essential utilities like high-speed WiFi, security, and attached bathroom.",
    image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"
    ],
    facilities: ["WiFi", "Security", "Attached bathroom", "Furnished"],
    ownerPhone: "+919876123456",
    occupancy: "Single Occupancy",
    availableRooms: 2,
    deposit: 5000
  },
  {
    id: 4,
    name: "Budget Student Rooms",
    type: "Shared Room",
    price: 4500,
    rating: 4.2,
    location: "Naugaon, Dehradun",
    distance: "0.8 km from DBUU",
    description: "Extremely affordable shared rooms designed specifically for price-conscious students. Offers triple sharing rooms with essential facilities like power backup, water supply, security, and common study area.",
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80"
    ],
    facilities: ["WiFi", "Security", "Parking"],
    ownerPhone: "+918877665544",
    occupancy: "Triple Sharing",
    availableRooms: 4,
    deposit: 3000
  },
  {
    id: 5,
    name: "Green Valley PG",
    type: "PG",
    price: 8000,
    rating: 4.7,
    location: "Chakrata Road, Dehradun",
    distance: "1.5 km from DBUU",
    description: "Surrounded by lush green mountains, Green Valley PG offers a serene atmosphere perfect for academics. Services include daily housekeeping, laundry, three healthy meals, private lockers, and attached bathrooms.",
    image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80"
    ],
    facilities: ["WiFi", "Food", "Laundry", "Security", "Attached bathroom", "Parking", "Furnished"],
    ownerPhone: "+917766554433",
    occupancy: "Double Sharing",
    availableRooms: 2,
    deposit: 8000
  },
  {
    id: 6,
    name: "Easy Stay Rooms",
    type: "Shared Room",
    price: 6000,
    rating: 4.5,
    location: "Naugaon, Dehradun",
    distance: "0.5 km from DBUU",
    description: "Comfortable twin sharing student lodging offering clean living conditions and warm friendly vibes. Features complete furnishing, high speed broadband connection, kitchen access, and prompt maintenance services.",
    image: "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80",
    thumbnails: [
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80"
    ],
    facilities: ["WiFi", "Laundry", "Security", "Parking", "Furnished"],
    ownerPhone: "+919632587410",
    occupancy: "Double Sharing",
    availableRooms: 1,
    deposit: 6000
  }
];
