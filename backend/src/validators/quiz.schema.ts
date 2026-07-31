import { z } from 'zod';

const booleanQuestionSchema = z.object({
  type: z.literal('BOOLEAN'),
  text: z.string().min(1, 'Question text is required'),
  answers: z
    .array(z.enum(['true', 'false']))
    .length(1, 'Boolean question must have exactly one answer ("true" or "false")'),
});

const inputQuestionSchema = z.object({
  type: z.literal('INPUT'),
  text: z.string().min(1, 'Question text is required'),
  answers: z
    .array(z.string().min(1, 'Answer cannot be empty'))
    .min(1, 'Short text question requires at least one valid answer'),
});

const checkboxQuestionSchema = z.object({
  type: z.literal('CHECKBOX'),
  text: z.string().min(1, 'Question text is required'),
  options: z
    .array(z.string().min(1, 'Option cannot be empty'))
    .min(2, 'Multiple choice requires at least 2 options'),
  answers: z.array(z.string()).min(1, 'Select at least one correct answer'),
});

export const questionSchema = z.discriminatedUnion('type', [
  booleanQuestionSchema,
  inputQuestionSchema,
  checkboxQuestionSchema,
]);

export const createQuizSchema = z.object({
  title: z.string().min(3, 'Quiz title must be at least 3 characters long'),
  questions: z
    .array(questionSchema)
    .min(1, 'Quiz must have at least one question')
    .superRefine((questions, ctx) => {
      questions.forEach((q, index) => {
        if (q.type === 'CHECKBOX') {
          const invalidAnswers = q.answers.filter((ans) => !q.options.includes(ans));
          if (invalidAnswers.length > 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'All answers must match one of the provided options',
              path: [index, 'answers'],
            });
          }
        }
      });
    }),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;

export const submitQuizSchema = z.object({
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
});

export type SubmitQuizInput = z.infer<typeof submitQuizSchema>;
