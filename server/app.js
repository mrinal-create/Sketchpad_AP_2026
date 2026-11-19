import "dotenv/config";
import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import apiRoutes from './routes/index.js';
import { toNodeHandler } from "better-auth/node";
import {auth} from "./lib/auth.js"
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://10.7.27.149:5173",
    credentials: true,
  }),
);

// view engine setup
app.set('views', path.join("./views"));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join("./public")));

app.use('/api', apiRoutes);

app.use(function(req, res, next) {
  next(createError(404));
});


app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

export default app;
