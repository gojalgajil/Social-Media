import Joi from "joi";

export const registerSchema = Joi.object({
    username: Joi.string().required(),
    full_name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const updateUserSchema = Joi.object({
    full_name: Joi.string().optional(),
    username: Joi.string().min(1).max(50).optional(),
    bio: Joi.string().max(500).optional()
});

export const createThreadSchema = Joi.object({
    content: Joi.string().required()
})

export const updateThreadSchema = Joi.object({
    content: Joi.string().optional(),
    image: Joi.string().optional()
})

export const createReplyThreadSchema = Joi.object({
    content: Joi.string().required(),
    image: Joi.string().optional()
})

export const updateReplyThreadSchema = Joi.object({
    content: Joi.string().optional(),
    image: Joi.string().optional()
})
