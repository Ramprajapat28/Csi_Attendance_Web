// LogoTransition.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LogoTransition() {
    const [step, setStep] = useState("logoOnly");

    useEffect(() => {
        const timer = setTimeout(() => {
        setStep("logoAndText");
    }, 2000); // 3 seconds
    return () => clearTimeout(timer);
    }, []);

    return (
    <div className="flex items-center justify-center relative flex-col h-screen bg-red-500">
        <AnimatePresence>
        {step === "logoOnly" && (
            <motion.img
            src="/src/assets/react.svg"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{y: -280, opacity: 1,scale: 0.5 }}
            transition={{ duration: 1 }}
            className="w-20 h-20 absolute"
            key="logo"
            />
        )}

        {/* {step === "logoAndText" && (
            <motion.div
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 50  }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            key="logoAndText"
            >
            <img src="/src/assets/react.svg" className="w-16 h-16 mb-2" />
            <h1 className="text-white text-2xl font-bold">Chalo</h1>
            </motion.div>
        )} */}
        {step === "logoAndText" && (
            <motion.div
            className="flex flex-col items-center absolute"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2}}//,ease: "easeOut" 
            key="logoAndText"
            >
                <h1 className="text-white text-2xl font-bold">Chalo</h1>
            </motion.div>
        )}
        </AnimatePresence>
        {/* {step === "logoAndText" && (
            <h1 className="text-white text-2xl font-bold">Chalo</h1>
        )} */}
    </div>
    );
}