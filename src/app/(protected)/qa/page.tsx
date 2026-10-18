"use client";
import AskQuestionCard from "@/app/_components/AskQuestionCard";
import CodeReferences from "@/app/_components/CodeReferences";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import MDEditor from "@uiw/react-md-editor";
import React, { Fragment, useState } from "react";

const QAPage = () => {
  const { projectId } = useProject();
  const { data: questions, isLoading } = api.project.getQuestions.useQuery({
    projectId,
  });
  const [questionIndex, setQuestionIndex] = useState(0);
  const question = questions?.[questionIndex];

  return (
    <Sheet>
      <AskQuestionCard />
      <div className="h-4"></div>
      <h1 className="text-xl font-semibold">Saved Questions</h1>
      <div className="h2"></div>
      <div className="flex flex-col gap-2">
        {questions?.map((q, i) => {
          return (
            <Fragment key={q.id}>
              <SheetTrigger onClick={() => setQuestionIndex(i)}>
                <div className="flex items-center gap-4 rounded-lg border bg-white p-4 shadow">
                  <img
                    src={q.user.imageUrl ?? ""}
                    alt="user avatar"
                    className="h-8 w-8 rounded-full"
                  />
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-2">
                      <p className="line-clamp-1 text-lg font-medium text-gray-700">
                        {q.question}
                      </p>
                      <span className="text-xs whitespace-nowrap text-gray-400">
                        {q.createAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="line-clamp-1 text-sm text-gray-500">
                      {q.answer}
                    </p>
                  </div>
                </div>
              </SheetTrigger>
            </Fragment>
          );
        })}
      </div>
      {question && (
        <SheetContent className="sm:max-w-[80vw]">
          <SheetHeader>
            <SheetTitle>{question.question}</SheetTitle>
            <div data-color-mode="light">
              <MDEditor.Markdown source={question.answer} />
            </div>
            <CodeReferences
              filesReferences={(question.filesReferences ?? []) as any}
            />
          </SheetHeader>
        </SheetContent>
      )}
    </Sheet>
  );
};

export default QAPage;
