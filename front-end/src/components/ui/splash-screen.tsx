import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Sparkles } from "lucide-react";

interface SplashScreenProps {
  isVisible: boolean;
}

export function SplashScreen({ isVisible }: SplashScreenProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background text-foreground"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
        >
          <div className="relative">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "backOut" }}
              className="relative z-10 p-6 rounded-3xl bg-primary text-primary-foreground shadow-2xl shadow-primary/30"
            >
              <GraduationCap className="w-16 h-16" strokeWidth={1.5} />
            </motion.div>
            
            <motion.div
              className="absolute -top-2 -right-2 text-secondary"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <Sparkles className="w-8 h-8 fill-secondary" />
            </motion.div>
          </div>
          
          <motion.div
            className="mt-8 text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-4xl font-display font-bold text-foreground">
              Skill<span className="text-primary">Swap</span>
            </h1>
            <p className="mt-2 text-muted-foreground font-medium">Learn. Teach. Connect.</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
