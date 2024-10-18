import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

type Props = {
  url: string | null | undefined;
};

export default function Thumbnail({ url }: Props) {
  if (!url) return;

  return (
    <Dialog>
      <DialogTrigger>
        <div className="relative overflow-hidden max-w-[360px] border rounded-lg my-2 cursor-zoom-in">
          <picture>
            <img
              loading="lazy"
              src={url}
              alt="Message image"
              className="rounded-md object-cover size-full"
            />
          </picture>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-[800px] border-none bg-transparent p-0 shadow-none">
        <DialogTitle></DialogTitle>
        <DialogDescription></DialogDescription>
        <picture>
          <img
            loading="lazy"
            src={url}
            alt="Message image"
            className="rounded-md object-cover size-full"
          />
        </picture>
      </DialogContent>
    </Dialog>
  );
}
