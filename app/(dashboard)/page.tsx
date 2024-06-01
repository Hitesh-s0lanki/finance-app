"use client";

import { Button } from "@/components/ui/button";
import { useNewAccount } from "@/features/accounts/hooks/use-new-account";

const Page = () => {
  const { onOpen } = useNewAccount();
  return (
    <div>
      <Button onClick={onOpen}>Open</Button>
    </div>
  );
};

export default Page;
