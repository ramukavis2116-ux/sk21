/**
 * Single source of truth for: Education Level → Degree → Branch/Specialisation → Subjects
 *
 * To extend in the future:
 *  - Add a new key under `collegeCatalog` for a new degree (e.g. "B.Com", "MBBS", "BA").
 *  - Add a new branch key with its subject list under any degree.
 *  - Add a new school level under `schoolCatalog`, or a new exam under `competitiveCatalog`.
 * Nothing else in the app needs to change.
 */

export type BranchCatalog = Record<string, string[]>;
export type DegreeCatalog = Record<string, BranchCatalog>;

// Common core subjects shared by most engineering branches.
const engineeringCore = [
  "Engineering Mathematics",
  "Engineering Physics",
  "Engineering Chemistry",
  "Engineering Graphics",
  "Basics of Programming",
  "Environmental Science",
];

const eng = (...subjects: string[]) => [...engineeringCore, ...subjects];

export const engineeringBranches: BranchCatalog = {
  "Computer Science and Engineering (CSE)": eng(
    "Data Structures", "Algorithms", "Database Management Systems", "Operating Systems",
    "Computer Networks", "Software Engineering", "Machine Learning", "Web Development", "Compiler Design"
  ),
  "Information Technology (IT)": eng(
    "Data Structures", "Database Management Systems", "Computer Networks", "Web Technologies",
    "Information Security", "Cloud Computing", "Software Engineering"
  ),
  "Artificial Intelligence and Machine Learning (AI & ML)": eng(
    "Python for AI", "Machine Learning", "Deep Learning", "Neural Networks",
    "Natural Language Processing", "Computer Vision", "Reinforcement Learning"
  ),
  "Artificial Intelligence and Data Science (AI & DS)": eng(
    "Python for Data Science", "Statistics & Probability", "Data Mining", "Machine Learning",
    "Big Data Analytics", "Data Visualization", "Deep Learning"
  ),
  "Electronics and Communication Engineering (ECE)": eng(
    "Circuit Theory", "Digital Electronics", "Signals & Systems", "Analog Communication",
    "Digital Communication", "Microprocessors & Microcontrollers", "VLSI Design", "Antennas & Wave Propagation"
  ),
  "Electrical and Electronics Engineering (EEE)": eng(
    "Electric Circuits", "Electrical Machines", "Power Systems", "Power Electronics",
    "Control Systems", "Measurements & Instrumentation"
  ),
  "Mechanical Engineering": eng(
    "Thermodynamics", "Fluid Mechanics", "Strength of Materials", "Machine Design",
    "Manufacturing Technology", "Heat Transfer", "Dynamics of Machinery"
  ),
  "Civil Engineering": eng(
    "Structural Analysis", "Geotechnical Engineering", "Fluid Mechanics & Hydraulics", "Surveying",
    "Concrete Technology", "Transportation Engineering", "Construction Management"
  ),
  "Chemical Engineering": eng(
    "Chemical Process Calculations", "Fluid Flow Operations", "Heat Transfer", "Mass Transfer",
    "Chemical Reaction Engineering", "Process Control", "Thermodynamics"
  ),
  "Biotechnology": eng(
    "Cell Biology", "Biochemistry", "Microbiology", "Genetic Engineering",
    "Bioprocess Engineering", "Molecular Biology", "Bioinformatics"
  ),
  "Biomedical Engineering": eng(
    "Human Anatomy & Physiology", "Biomechanics", "Medical Instrumentation", "Biosignal Processing",
    "Medical Imaging", "Biomaterials"
  ),
  "Aeronautical Engineering": eng(
    "Aerodynamics", "Aircraft Structures", "Flight Mechanics", "Propulsion",
    "Aircraft Systems", "Aerospace Materials"
  ),
  "Aerospace Engineering": eng(
    "Aerodynamics", "Space Dynamics", "Rocket Propulsion", "Aerospace Structures",
    "Flight Mechanics", "Avionics"
  ),
  "Automobile Engineering": eng(
    "Automotive Engines", "Vehicle Dynamics", "Automotive Transmission", "Automotive Electrical & Electronics",
    "Vehicle Body Engineering", "Automotive Fuels & Emissions"
  ),
  "Food Technology": eng(
    "Food Chemistry", "Food Microbiology", "Food Preservation", "Food Engineering",
    "Dairy Technology", "Food Quality & Safety", "Food Packaging Technology"
  ),
  "Food Processing Technology": eng(
    "Unit Operations in Food Processing", "Post Harvest Technology", "Fruits & Vegetable Processing",
    "Cereal & Pulse Technology", "Meat & Poultry Processing", "Food Plant Sanitation"
  ),
  "Agricultural Engineering": eng(
    "Soil & Water Conservation", "Farm Machinery & Equipment", "Irrigation Engineering",
    "Agricultural Process Engineering", "Renewable Energy in Agriculture"
  ),
  "Industrial Engineering": eng(
    "Operations Research", "Production Planning & Control", "Quality Engineering",
    "Supply Chain Management", "Work Study & Ergonomics", "Facility Planning"
  ),
  "Production Engineering": eng(
    "Manufacturing Processes", "Metal Cutting & Machine Tools", "Metrology & Quality Control",
    "CAD/CAM", "Tool Design", "Industrial Automation"
  ),
  "Petroleum Engineering": eng(
    "Petroleum Geology", "Drilling Engineering", "Reservoir Engineering",
    "Production Engineering", "Petroleum Refining", "Pipeline Engineering"
  ),
  "Mining Engineering": eng(
    "Mine Development", "Rock Mechanics", "Mine Ventilation", "Surface Mining",
    "Underground Mining", "Mine Safety & Legislation"
  ),
  "Mechatronics Engineering": eng(
    "Sensors & Actuators", "Microcontrollers & Embedded Systems", "Control Systems",
    "Hydraulics & Pneumatics", "Industrial Robotics", "CNC Machines"
  ),
  "Instrumentation and Control Engineering": eng(
    "Transducers & Measurements", "Process Control", "Industrial Instrumentation",
    "Control Systems", "PLC & SCADA", "Analytical Instrumentation"
  ),
  "Robotics and Automation": eng(
    "Robot Kinematics", "Robot Dynamics & Control", "Industrial Automation",
    "Machine Vision", "Embedded Systems", "AI for Robotics"
  ),
  "Environmental Engineering": eng(
    "Water Supply Engineering", "Wastewater Treatment", "Air Pollution Control",
    "Solid Waste Management", "Environmental Impact Assessment"
  ),
  "Marine Engineering": eng(
    "Marine Diesel Engines", "Ship Construction", "Marine Auxiliary Machinery",
    "Naval Architecture", "Marine Electrical Technology", "Ship Safety & Survival"
  ),
  "Metallurgical and Materials Engineering": eng(
    "Physical Metallurgy", "Extractive Metallurgy", "Mechanical Behaviour of Materials",
    "Phase Transformations", "Materials Characterization", "Foundry & Welding Technology"
  ),
  "Textile Technology": eng(
    "Fibre Science", "Yarn Manufacturing", "Fabric Manufacturing",
    "Textile Chemical Processing", "Textile Testing & Quality Control", "Apparel Technology"
  ),
  "Electronics and Instrumentation Engineering": eng(
    "Electronic Devices & Circuits", "Digital Electronics", "Industrial Instrumentation",
    "Control Systems", "Microprocessors", "Biomedical Instrumentation"
  ),
  "Computer Science and Business Systems": eng(
    "Data Structures", "Database Management Systems", "Business Communication",
    "Financial & Cost Accounting", "Operations Research", "Design Thinking", "Software Engineering"
  ),
  "Internet of Things (IoT)": eng(
    "Embedded Systems", "Sensors & Actuators", "Wireless Networks",
    "IoT Protocols & Architecture", "Cloud & Edge Computing", "IoT Security"
  ),
  "Cyber Security": eng(
    "Computer Networks", "Cryptography", "Network Security", "Ethical Hacking",
    "Digital Forensics", "Cyber Laws & Ethics"
  ),
  "Software Engineering": eng(
    "Software Requirements Engineering", "Software Design & Architecture", "Software Testing",
    "Agile & DevOps", "Data Structures", "Project Management"
  ),
};

export const collegeCatalog: DegreeCatalog = {
  "B.Tech": engineeringBranches,
  "B.E": engineeringBranches,
  "B.Sc": {
    "Computer Science": ["Programming Fundamentals", "Data Structures", "Database Management Systems (DBMS)", "Operating Systems", "Computer Networks", "Object Oriented Programming", "Web Technologies", "Software Engineering"],
    "Information Technology": ["Programming in Python", "Database Management Systems (DBMS)", "Computer Networks", "Web Development", "Operating Systems", "Information Security", "Cloud Computing"],
    "Mathematics": ["Algebra", "Calculus", "Statistics", "Differential Equations", "Real Analysis", "Linear Algebra", "Numerical Methods", "Discrete Mathematics"],
    "Physics": ["Mechanics", "Optics", "Electronics", "Quantum Physics", "Thermodynamics", "Electricity & Magnetism", "Nuclear Physics", "Solid State Physics"],
    "Chemistry": ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", "Analytical Chemistry", "Spectroscopy", "Environmental Chemistry"],
    "Statistics": ["Descriptive Statistics", "Probability Theory", "Statistical Inference", "Regression Analysis", "Sampling Techniques", "Design of Experiments", "Time Series Analysis"],
    "Data Science": ["Python for Data Science", "Statistics for Data Science", "Data Structures", "Data Visualization", "Machine Learning Basics", "Database Management Systems (DBMS)", "Big Data Fundamentals"],
    "Artificial Intelligence": ["Introduction to AI", "Python Programming", "Machine Learning", "Neural Networks & Deep Learning", "Natural Language Processing", "Knowledge Representation & Reasoning", "Computer Vision Basics"],
    "Cyber Security": ["Fundamentals of Cyber Security", "Computer Networks", "Cryptography", "Ethical Hacking", "Network Security", "Digital Forensics", "Cyber Laws & Ethics"],
    "Biotechnology": ["Cell Biology", "Genetics", "Molecular Biology", "Microbiology", "Genetic Engineering", "Bioprocess Technology", "Immunology"],
    "Microbiology": ["General Microbiology", "Bacteriology", "Virology", "Mycology", "Immunology", "Medical Microbiology", "Food & Industrial Microbiology"],
    "Biochemistry": ["Biomolecules", "Enzymology", "Metabolism", "Molecular Biology", "Clinical Biochemistry", "Bioenergetics", "Analytical Techniques in Biochemistry"],
    "Zoology": ["Animal Diversity", "Cell Biology", "Genetics", "Animal Physiology", "Ecology", "Evolution", "Developmental Biology"],
    "Botany": ["Plant Diversity", "Plant Anatomy", "Plant Physiology", "Genetics", "Ecology & Environment", "Plant Pathology", "Economic Botany"],
    "Psychology": ["General Psychology", "Developmental Psychology", "Social Psychology", "Abnormal Psychology", "Cognitive Psychology", "Psychological Statistics", "Counselling Psychology"],
    "Visual Communication": ["Fundamentals of Visual Communication", "Graphic Design", "Photography", "Media Studies", "Film Studies & Editing", "Animation Basics", "Advertising & Branding"],
  },

  "BCA": {
    "General": ["Programming in C", "Data Structures", "DBMS", "Operating Systems", "Java", "Web Technologies", "Python", "Software Engineering"],
  },
};

// Legacy branch names kept working so saved profiles don't break.
export const legacyBranchAliases: Record<string, string> = {
  "Computer Science": "Computer Science and Engineering (CSE)",
  "Electronics": "Electronics and Communication Engineering (ECE)",
  "Electrical": "Electrical and Electronics Engineering (EEE)",
  "Mechanical": "Mechanical Engineering",
  "Civil": "Civil Engineering",
};

export const schoolCatalog: Record<string, string[]> = {
  "Class 1-5": ["Mathematics", "English", "Science", "Social Studies", "Hindi"],
  "Class 6-8": ["Mathematics", "English", "Science", "Social Studies", "Hindi", "Computer Science"],
  "Class 9-10": ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Social Science", "Hindi", "Computer Applications"],
  "Class 11-12 Science": ["Physics", "Chemistry", "Mathematics", "Biology", "English", "Computer Science"],
  "Class 11-12 Commerce": ["Accountancy", "Business Studies", "Economics", "Mathematics", "English"],
  "Class 11-12 Arts": ["History", "Political Science", "Geography", "Economics", "English", "Psychology"],
};

export const competitiveCatalog: Record<string, string[]> = {
  "JEE": ["Physics", "Chemistry", "Mathematics"],
  "NEET": ["Physics", "Chemistry", "Biology (Botany)", "Biology (Zoology)"],
  "UPSC": ["General Studies", "Indian Polity", "Geography", "History", "Economics", "Science & Tech", "Ethics"],
  "CAT": ["Quantitative Aptitude", "Verbal Ability", "Data Interpretation", "Logical Reasoning"],
  "GATE": ["Engineering Mathematics", "General Aptitude", "Core Subject"],
};
