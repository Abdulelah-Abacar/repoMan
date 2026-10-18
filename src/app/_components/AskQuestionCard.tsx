import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import useProject from "@/hooks/use-project";
import { useState } from "react";
import { askQuestion } from "../(protected)/dashboard/actions";
import { readStreamableValue } from "@ai-sdk/rsc";
import MDEditor from "@uiw/react-md-editor";
import CodeReferences from "./CodeReferences";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";

const AskQuestionCard = () => {
  const { project } = useProject();
  const [question, setQuestion] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filesReferences, setFilesReferences] = useState<
    { fileName: string; sourceCode: string; summary: string }[]
  >([]);
  const [answer, setAnswer] = useState("");
  const refetch = useRefetch();

  const saveAnswer = api.project.saveAnswer.useMutation();

  const onSubmit = async (e: React.FormEvent) => {
    setAnswer("");
    setFilesReferences([]);
    e.preventDefault();
    if (!project?.id) return;
    setLoading(true);

    const { output, filesReferences } = await askQuestion(
      question,
      project?.id,
    );
    setOpen(true);
    setFilesReferences(filesReferences);

    for await (const chunk of readStreamableValue(output)) {
      if (chunk) {
        setAnswer((prev) => prev + chunk);
      }
    }
    setLoading(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={() => {
          setOpen(false);
          setQuestion("");
        }}
      >
        <DialogContent className="sm:max-w-[80vw]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <DialogTitle>
                <span className="text-xl font-bold text-gray-900">RM</span>
              </DialogTitle>
              <Button
                disabled={saveAnswer.isPending}
                onClick={() => {
                  saveAnswer.mutate(
                    {
                      projectId: project!.id,
                      question,
                      answer,
                      filesReferences,
                    },
                    {
                      onSuccess: () => {
                        toast.success("Answer Saved!");
                        refetch();
                      },

                      onError: () => {
                        toast.error("Save Failed!");
                      },
                    },
                  );
                }}
                variant={"outline"}
              >
                Save Answer
              </Button>
            </div>
          </DialogHeader>
          <div data-color-mode="light">
            <MDEditor.Markdown
              source={answer}
              className="!scroll-white !h-full max-h-[40vh] max-w-[70vw] overflow-y-scroll"
            />
          </div>
          <div className="h-4"></div>
          <CodeReferences filesReferences={filesReferences} />
          <Button
            type="button"
            onClick={() => {
              setOpen(false);
              setQuestion("");
            }}
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
      <Card className="relative col-span-3">
        <CardHeader>
          <CardTitle>Ask a Question</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Textarea
              placeholder="Which file should I edit to change the home page?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <Button className="w-fit" type="submit" disabled={loading}>
              Ask RepoMan
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default AskQuestionCard;
