"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import MagicDown from "@/components/MagicDown";
import { CheckCircle2, MessageSquare, ArrowRight } from "lucide-react";
import { cn } from "@/utils/style";

const formSchema = z.object({
  answers: z.string().min(1, "请提供您的回答以帮助更好地分析问题"),
});

interface DeepThinkQuestionsFeedbackProps {
  questions: string;
  onSubmit: (answers: string) => void;
  isLoading?: boolean;
  className?: string;
}

export function DeepThinkQuestionsFeedback({
  questions,
  onSubmit,
  isLoading = false,
  className,
}: DeepThinkQuestionsFeedbackProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answers: "",
    },
  });

  async function handleSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting || isLoading) return;
    
    try {
      setIsSubmitting(true);
      onSubmit(values.answers);
    } finally {
      setIsSubmitting(false);
    }
  }

  const isProcessing = isSubmitting || isLoading;

  return (
    <div className={cn("space-y-4", className)}>
      {/* 澄清问题显示 */}
      <Card className="bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
            <MessageSquare className="w-5 h-5" />
            {t("deepThink.questions.title")}
          </CardTitle>
          <p className="text-sm text-purple-600 dark:text-purple-300">
            {t("deepThink.questions.description")}
          </p>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none text-sm">
            <MagicDown value={questions} onChange={() => {}} />
          </div>
        </CardContent>
      </Card>

      {/* 用户回答表单 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            {t("deepThink.questions.yourAnswers")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("deepThink.questions.answerPrompt")}
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="answers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("deepThink.questions.answers")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("deepThink.questions.placeholder")}
                        className="min-h-[120px]"
                        {...field}
                        disabled={isProcessing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="min-w-[120px]"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      {t("deepThink.questions.processing")}
                    </>
                  ) : (
                    <>
                      {t("deepThink.questions.continue")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* 帮助提示 */}
      <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
        <p className="font-medium mb-1">{t("deepThink.questions.tips.title")}</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>{t("deepThink.questions.tips.specific")}</li>
          <li>{t("deepThink.questions.tips.context")}</li>
          <li>{t("deepThink.questions.tips.constraints")}</li>
          <li>{t("deepThink.questions.tips.skip")}</li>
        </ul>
      </div>
    </div>
  );
}
