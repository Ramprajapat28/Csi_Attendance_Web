import { motion } from 'framer-motion';

export default function Dashboard() {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-neutral-300">Welcome to QroCde.</p>
    </motion.div>
  );
}
