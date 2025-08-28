# **App Name**: CleanLog

## Core Features:

- User Authentication: User authentication with login/logout functionality using username and password.
- Protocol Creation: Create a new cleaning protocol with fields for vehicle data (license plates), cleaning details, quality control, environmental data (GPS location, date, time, water temperature, water quality), and contamination reports.
- License Plate Autocomplete: Auto-completion of LKW-Kennzeichen (license plate) and Anhänger-Kennzeichen (trailer plate) fields based on previously entered data, leveraging a tool to learn the user's habits.
- Conditional Fields: Conditional display of 'Meldung Kontamination' (contamination report) fields based on the 'Ergebnis der Kontrolle' (inspection result).
- Environmental Data Capture: Record GPS coordinates, date, and time automatically when a protocol is started, with manual override option for location.
- Data Persistence: Store protocols and user credentials using local storage and a simple, file-based system, so there is no need for a database.
- Driver Dashboard: Driver dashboard displaying a summary of recent protocols.

## Style Guidelines:

- Primary color: Dark blue (#30475E), conveying professionalism and cleanliness. 
- Background color: Light gray (#D6D5A8), offering a clean and neutral backdrop.
- Accent color: Muted teal (#82AAA5) to provide subtle contrast without overwhelming the user.
- Font pairing: 'Inter' (sans-serif) for body text to ensure readability, paired with 'PT Sans' (sans-serif) for headings.
- Use clear and minimalist icons for navigation and actions within the app.
- Maintain a simple, single-column layout for form entry on mobile. Tables can be used in the dashboard view.
- Use subtle transitions and animations for feedback and to guide the user through the protocol creation process.