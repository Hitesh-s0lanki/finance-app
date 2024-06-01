import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useNewTransaction } from "../hooks/use-new-transaction";
import { insertTransactionSchema } from "@/db/schema";
import { z } from "zod";
import { useCreateGetTransaction } from "../api/use-create-transaction";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import { useCreateCategory } from "@/features/categories/api/use-create-category";
import TransactionForm from "./transaction-form";
import { Loader2 } from "lucide-react";
import { useCreateGetAccount } from "@/features/accounts/api/use-create-account";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";

const formSchema = insertTransactionSchema.omit({
  id: true,
});

type FormValues = z.input<typeof formSchema>;

const NewTransactionSheet = () => {
  const { isOpen, onClose } = useNewTransaction();
  const mutation = useCreateGetTransaction();

  const categoryQuery = useGetCategories();
  const categoryMutation = useCreateCategory();
  const onCreateCategory = (name: string) =>
    categoryMutation.mutate({
      name,
    });
  const categoryOptions = (categoryQuery.data ?? []).map((category) => ({
    label: category.name,
    value: category.id,
  }));

  const accountQuery = useGetAccounts();
  const accountMutation = useCreateGetAccount();
  const onCreateAccount = (name: string) =>
    accountMutation.mutate({
      name,
    });
  const accountOptions = (accountQuery.data ?? []).map((category) => ({
    label: category.name,
    value: category.id,
  }));

  const isPending =
    mutation.isPending ||
    categoryMutation.isPending ||
    accountMutation.isPending;
  const isLoading = categoryQuery.isLoading || accountQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    mutation.mutate(values, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className=" space-y-4">
        <SheetHeader>
          <SheetTitle>New Transaction</SheetTitle>
          <SheetDescription>Add a new Transaction.</SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className=" absolute inset-0 flex items-center justify-center">
            <Loader2 className=" size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <TransactionForm
            onSubmit={onSubmit}
            disabled={isPending}
            onCreateCategory={onCreateCategory}
            categoryOptions={categoryOptions}
            onCreateAccount={onCreateAccount}
            accountOptions={accountOptions}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};

export default NewTransactionSheet;
