package com.findback.config;

import com.findback.model.*;
import com.findback.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private CampusLocationRepository campusLocationRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${campusfind.seed.sample-data:true}")
    private boolean seedSampleData;

    @Value("${campusfind.admin.initial-email:admin@campusfind.edu}")
    private String initialAdminEmail;

    @Value("${campusfind.admin.initial-password:Admin@123}")
    private String initialAdminPassword;

    @Value("${campusfind.admin.initial-name:Campus Administrator}")
    private String initialAdminName;

    @Value("${campusfind.admin.initial-student-id:ADM001}")
    private String initialAdminStudentId;

    @Override
    public void run(String... args) {
        logger.info("Initializing CampusFind database: master locations and categories...");

        seedCampusLocations();
        seedCategories();
        seedInitialAdmin();

        if (seedSampleData) {
            logger.info("Development mode (campusfind.seed.sample-data=true): seeding demo students and sample campus reports...");
            seedSampleStudents();
            seedSampleCampusItems();
        } else {
            logger.info("Production mode (campusfind.seed.sample-data=false): Skipping sample student accounts and fake reports.");
        }

        logger.info("CampusFind initialized successfully!");
    }


    private void seedCampusLocations() {
        String[][] locations = {
                {"Main Gate", "MG", "Entrance Zone", "Campus primary security gate and visitor entry booth"},
                {"Library", "LIB", "Academic Zone", "Central campus library, digital study rooms and reading halls"},
                {"Canteen", "CAN", "Central Zone", "Campus cafeteria, food courts and open dining pavilion"},
                {"Academic Block", "AB", "Academic Zone", "Classrooms, lecture theatres and faculty staffrooms"},
                {"Computer Block", "CB", "Tech Zone", "Computer science labs, high-performance computing centers"},
                {"Laboratory", "LAB", "Science Zone", "Physics, Chemistry, and specialized engineering laboratories"},
                {"Seminar Hall", "SH", "Central Zone", "Air-conditioned conference room and symposium venue"},
                {"Auditorium", "AUD", "Cultural Zone", "Main college indoor auditorium and cultural center"},
                {"Playground", "PG", "Sports Zone", "Athletics track, cricket/football grounds and basketball court"},
                {"Parking Area", "PKG", "Peripheral Zone", "Student and staff vehicle parking bays"},
                {"Hostel", "HST", "Residential Zone", "Campus student dormitories, dining mess and common rooms"},
                {"Bus Area", "BUS", "Transport Zone", "College transport terminal and boarding bays"},
                {"Administrative Block", "ADM", "Admin Zone", "Principal office, accounts, admissions and student welfare"},
                {"Other Campus Area", "OTH", "General Zone", "Walkways, garden pavilions, corridors and common lounges"}
        };

        for (String[] loc : locations) {
            if (!campusLocationRepository.existsByNameIgnoreCase(loc[0])) {
                campusLocationRepository.save(new CampusLocation(loc[0], loc[1], loc[2], loc[3]));
            }
        }
        logger.info("Seeded 14 predefined campus locations.");
    }

    private void seedCategories() {
        String[][] categories = {
                {"ID Card", "CreditCard", "Student college identification cards, library cards, and access badges"},
                {"Mobile Phone", "Smartphone", "Smartphones, feature phones, cases, and SIM accessories"},
                {"Laptop", "Laptop", "Laptops, MacBooks, tablets, and power adapter chargers"},
                {"Wallet", "Wallet", "Wallets, cardholders, money pouches, and purses"},
                {"Bag", "Briefcase", "College backpacks, laptop bags, tote bags, and sports duffels"},
                {"Keys", "Key", "Room keys, hostel keys, vehicle keys, bike keys, and locker keys"},
                {"Books", "BookOpen", "Textbooks, notebooks, lab manuals, syllabus files, and library books"},
                {"Calculator", "Calculator", "Scientific calculators, engineering calculators, and math instruments"},
                {"Documents", "FileText", "Official certificates, mark sheets, admit cards, and project reports"},
                {"Electronics", "Headphones", "Wireless earbuds, smartwatches, power banks, and USB drives"},
                {"Jewelry", "Watch", "Wristwatches, fitness trackers, rings, and chains"},
                {"Clothing", "Shirt", "Jackets, college hoodies, lab coats, aprons, and umbrellas"},
                {"Accessories", "Glasses", "Eyeglasses, sunglasses, water bottles, and stationery pouches"},
                {"Other", "HelpCircle", "Uncategorized personal belongings found across campus"}
        };

        for (String[] cat : categories) {
            if (!categoryRepository.existsByNameIgnoreCase(cat[0])) {
                categoryRepository.save(new Category(cat[0], cat[1], cat[2]));
            }
        }
        logger.info("Seeded 14 campus item categories.");
    }

    private void seedInitialAdmin() {
        // Create initial administrator if not already present
        if (!userRepository.existsByEmail(initialAdminEmail)) {
            User admin = new User(
                    initialAdminStudentId,
                    initialAdminName,
                    initialAdminEmail,
                    passwordEncoder.encode(initialAdminPassword),
                    "+1 555-0100",
                    "Campus Security & Administration",
                    "Staff",
                    "Admin",
                    Role.ADMIN
            );
            admin.setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150");
            admin.setStatus("APPROVED");
            userRepository.save(admin);
            logger.info("Initialized primary campus administrator: {}", initialAdminEmail);
        }

        userRepository.findByStudentId("ADM002").ifPresentOrElse(
                existing -> {
                    if (!"admin.officer@campusfind.edu".equalsIgnoreCase(existing.getEmail())) {
                        existing.setEmail("admin.officer@campusfind.edu");
                        userRepository.save(existing);
                    }
                },
                () -> {
                    if (!userRepository.existsByEmail("admin.officer@campusfind.edu")) {
                        User admin2 = new User(
                                "ADM002",
                                "Admin Officer",
                                "admin.officer@campusfind.edu",
                                passwordEncoder.encode(initialAdminPassword),
                                "+1 555-0199",
                                "Administration",
                                "Staff",
                                "Admin",
                                Role.ADMIN
                        );
                        admin2.setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150");
                        admin2.setStatus("APPROVED");
                        userRepository.save(admin2);
                    }
                }
        );
    }

    private void seedSampleStudents() {
        // Student 1: Aravind Sharma (STU2024001)
        if (!userRepository.existsByEmail("aravind@student.college.edu")) {
            User s1 = new User(
                    "STU2024001",
                    "Aravind Sharma",
                    "aravind@student.college.edu",
                    passwordEncoder.encode("password123"),
                    "+1 555-0101",
                    "Computer Science & Engineering",
                    "3rd Year",
                    "Section A",
                    Role.STUDENT
            );
            s1.setAvatarUrl("https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150");
            s1.setStatus("APPROVED");
            userRepository.save(s1);
        }

        // Student 2: Priya Patel (STU2024002)
        if (!userRepository.existsByEmail("priya@student.college.edu")) {
            User s2 = new User(
                    "STU2024002",
                    "Priya Patel",
                    "priya@student.college.edu",
                    passwordEncoder.encode("password123"),
                    "+1 555-0102",
                    "Electronics & Communication",
                    "2nd Year",
                    "Section B",
                    Role.STUDENT
            );
            s2.setAvatarUrl("https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150");
            s2.setStatus("APPROVED");
            userRepository.save(s2);
        }

        // Student 3: Alex Johnson (STU2024003)
        if (!userRepository.existsByEmail("alex@example.com")) {
            User s3 = new User(
                    "STU2024003",
                    "Alex Johnson",
                    "alex@example.com",
                    passwordEncoder.encode("password123"),
                    "+1 555-0103",
                    "Information Technology",
                    "4th Year",
                    "Section C",
                    Role.STUDENT
            );
            s3.setAvatarUrl("https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150");
            s3.setStatus("APPROVED");
            s3.setApprovedAt(java.time.LocalDateTime.now());
            s3.setApprovedBy("System Auto-Setup");
            userRepository.save(s3);
        }

        // Ensure all seeded and legacy active users have status APPROVED
        userRepository.findAll().forEach(u -> {
            if ("ACTIVE".equalsIgnoreCase(u.getStatus()) || u.getStatus() == null) {
                u.setStatus("APPROVED");
                u.setApprovedAt(java.time.LocalDateTime.now());
                u.setApprovedBy("Campus Administrator");
                userRepository.save(u);
            }
        });
    }

    private void seedSampleCampusItems() {
        if (itemRepository.count() > 0) return;

        User aravind = userRepository.findByEmail("aravind@student.college.edu").orElse(null);
        User priya = userRepository.findByEmail("priya@student.college.edu").orElse(null);

        if (aravind != null) {
            // Lost Item 1: Student ID Card
            Item item1 = new Item();
            item1.setType(ItemType.LOST);
            item1.setTitle("Lost Student ID Card & Blue College Lanyard");
            item1.setCategory("ID Card");
            item1.setBrand("Campus");
            item1.setModel("Batch 2024");
            item1.setColor("Blue");
            item1.setDescription("Lost my college ID card with blue ribbon lanyard near the central library digital reading section.");
            item1.setDateLostOrFound(LocalDate.now().minusDays(1));
            item1.setApproximateTime("11:30 AM");
            item1.setLocation("Library");
            item1.setImageUrl("https://images.unsplash.com/photo-1589330694653-dad6ef0190b8?w=600");
            item1.setStatus(ItemStatus.ACTIVE);
            item1.setModerationStatus(ModerationStatus.APPROVED);
            item1.setUser(aravind);
            itemRepository.save(item1);

            // Lost Item 2: Casio Calculator
            Item item2 = new Item();
            item2.setType(ItemType.LOST);
            item2.setTitle("Lost Casio Scientific Calculator FX-991EX");
            item2.setCategory("Calculator");
            item2.setBrand("Casio");
            item2.setModel("fx-991EX ClassWiz");
            item2.setColor("Black / White");
            item2.setDescription("Black and white scientific calculator left behind on bench 4 in Computer Block Lab 2.");
            item2.setDateLostOrFound(LocalDate.now());
            item2.setApproximateTime("02:15 PM");
            item2.setLocation("Computer Block");
            item2.setImageUrl("https://images.unsplash.com/photo-1611125832047-1d7ad1e8e485?w=600");
            item2.setStatus(ItemStatus.ACTIVE);
            item2.setModerationStatus(ModerationStatus.APPROVED);
            item2.setUser(aravind);
            itemRepository.save(item2);
        }

        if (priya != null) {
            // Found Item 1: Casio Calculator at Computer Block (Potential Match!)
            Item item3 = new Item();
            item3.setType(ItemType.FOUND);
            item3.setTitle("Found Casio FX-991 Scientific Calculator");
            item3.setCategory("Calculator");
            item3.setBrand("Casio");
            item3.setModel("FX-991EX");
            item3.setColor("Black");
            item3.setDescription("Found a Casio FX-991 calculator on the desk in Computer Lab after practical session.");
            item3.setDateLostOrFound(LocalDate.now());
            item3.setApproximateTime("03:00 PM");
            item3.setLocation("Computer Block");
            item3.setImageUrl("https://images.unsplash.com/photo-1611125832047-1d7ad1e8e485?w=600");
            item3.setStatus(ItemStatus.ACTIVE);
            item3.setModerationStatus(ModerationStatus.APPROVED);
            item3.setUser(priya);
            itemRepository.save(item3);

            // Found Item 2: Apple AirPods Pro in Canteen
            Item item4 = new Item();
            item4.setType(ItemType.FOUND);
            item4.setTitle("Found Apple AirPods Pro with White Case");
            item4.setCategory("Electronics");
            item4.setBrand("Apple");
            item4.setModel("AirPods Pro 2");
            item4.setColor("White");
            item4.setDescription("Found wireless earbuds in white charging case on table near Canteen counter.");
            item4.setDateLostOrFound(LocalDate.now().minusDays(2));
            item4.setApproximateTime("01:20 PM");
            item4.setLocation("Canteen");
            item4.setImageUrl("https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600");
            item4.setStatus(ItemStatus.ACTIVE);
            item4.setModerationStatus(ModerationStatus.APPROVED);
            item4.setUser(priya);
            itemRepository.save(item4);
        }

        logger.info("Seeded sample campus items.");
    }
}
