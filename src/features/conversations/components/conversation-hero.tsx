import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  name?: string;
  image?: string;
};

export default function ConversationHero({ image, name = "Member" }: Props) {
  return (
    <div className="mt-[88px] mx-5 mb-4">
      <div className="flex items-center gap-x-1 mb-2">
        <Avatar className="size-14 mr-2">
          <AvatarImage src={image} />
          <AvatarFallback>{name?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
      <p className="text-2xl font-bold">{name}</p>
      <p className="font-normal text-slate-800 mb-4">
        This conversation is just between you and <strong>{name}</strong>
      </p>
    </div>
  );
}
