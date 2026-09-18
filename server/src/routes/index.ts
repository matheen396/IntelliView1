import { Router } from "express";
import usersRouter from "./users.routes";
import authRouter from "./auth.routes";
import protectedRouter from "./protected.routes";
import resumeRouter from "./resume.routes";
import interviewRouter from "./interview.routes";

const router = Router();

// Mount route modules
router.use("/users", usersRouter);
router.use("/auth", authRouter);
router.use("/protected", protectedRouter);
router.use("/resumes", resumeRouter);
router.use("/interview", interviewRouter);

// API info route
router.get("/", (req, res) => {
  res.json({
    message: "IntelliView API v1",
    endpoints: {
      users: "/api/users",
      auth: "/api/auth",
      protected: "/api/protected",
      resumes: "/api/resumes",
      interview: "/api/interview",
    },
  });
});

export default router;
