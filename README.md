# Tuckshop Stock Manager

A modern, responsive web application designed for tuckshop administrators to efficiently manage inventory, track stock levels, and organize products. Built with **React**, **TypeScript**, and **Material UI**, utilizing **Vite** for a fast development experience.

## 🚀 Features

  * **Dashboard Overview**: View key statistics at a glance, including total product count and low stock alerts.
  * **Product Management**:
      * **Add Products**: Easy-to-use modal interface for adding new stock items.
      * **Edit Details**: Update product names, prices, stock levels, and categories.
      * **Delete Items**: Remove obsolete products from the inventory.
  * **Advanced Filtering & Search**:
      * **Search Bar**: Quickly find products by name.
      * **Category Filter**: Filter items by categories (Snacks, Beverages, School Supplies, etc.).
      * **Low Stock Filter**: One-click toggle to see items running low (≤ 5 items).
      * **Price Range Slider**: Filter products within specific price brackets.
  * **Sorting**: Sort inventory by Name, Price, or Stock level in ascending or descending order.
  * **Responsive UI**: A glassmorphism-inspired dark theme built with Material UI that works on various screen sizes.

## 🛠️ Tech Stack

### Frontend

  * **Framework**: [React](https://react.dev/) (v19) with [TypeScript](https://www.typescriptlang.org/)
  * **Build Tool**: [Vite](https://vitejs.dev/)
  * **Styling & UI**: [Material UI (MUI)](https://mui.com/) & Emotion
  * **Icons**: MUI Icons Material

### Backend (Server)

  * **Runtime**: [Node.js](https://nodejs.org/)
  * **Framework**: [Express.js](https://expressjs.com/)
  * **Database**: [PostgreSQL](https://www.postgresql.org/)
  * **Driver**: `pg` (node-postgres)

> **Note**: The frontend currently utilizes mock data for demonstration purposes (`src/App.tsx`), but the project includes a `server` directory setup for a full-stack integration with PostgreSQL.jh

## 📂 Project Structure

```text
tuckshop-stock-manager/
├── public/              # Static assets
├── server/              # Backend server code
│   ├── .env             # Environment variables (DB config)
│   ├── package.json     # Server dependencies
│   └── ...
├── src/                 # Frontend source code
│   ├── assets/          # Images and SVGs
│   ├── components/      # Reusable UI components (Navbar, ProductCard, etc.)
│   ├── App.tsx          # Main application logic
│   ├── main.tsx         # Entry point & Theme provider
│   └── types.ts         # TypeScript interfaces
├── .gitignore           # Git ignore rules
├── index.html           # HTML entry point
├── package.json         # Frontend dependencies
├── tsconfig.json        # TypeScript configuration
└── vite.config.ts       # Vite configuration
```

## ⚡ Getting Started

Follow these steps to set up the project locally.

### Prerequisites

  * Node.js (v18 or higher recommended)
  * npm or yarn
  * PostgreSQL (if running the backend)

### 1\. Client (Frontend) Setup

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/your-username/tuckshop-stock-manager.git
    cd tuckshop-stock-manager
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Run the development server**:

    ```bash
    npm run dev
    ```

4.  **Open the app**:
    Navigate to `http://localhost:5173` in your browser.

### 2\. Server (Backend) Setup

1.  **Navigate to the server directory**:

    ```bash
    cd server
    ```

2.  **Install server dependencies**:

    ```bash
    npm install
    ```

3.  **Configure Environment**:
    Ensure the `.env` file in the `server` directory matches your local PostgreSQL configuration:

    ```env
    PORT=3000
    DB_USER=postgres
    DB_PASS=your_password
    DB_NAME=tuckshop
    DB_HOST=localhost
    DB_PORT=5432
    ```

4.  **Start the server**:

    ```bash
    npm start
    # or if you have nodemon/ts-node configured for dev:
    npm run dev
    ```

## 🧪 Development Notes

  * **Mock Data**: The frontend currently loads data from `MOCK_PRODUCTS` in `src/App.tsx`. To connect it to the backend, you will need to replace the state initialization with `fetch` or `axios` calls to your Express API endpoints.
  * **Theming**: The app uses a custom Material UI theme defined in `src/main.tsx`. You can adjust the color palette (Primary: `#4FC3F7`, Secondary: `#FFB74D`) there.

## 🤝 Contributing

Contributions are welcome\! Please fork the repository and submit a pull request for any features, bug fixes, or documentation improvements.

## wegb 📄 License

This project is licensed under the ISC License.