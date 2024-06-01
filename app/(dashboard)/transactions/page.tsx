"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";
import { useBulkDeleteTransactions } from "@/features/transactions/api/use-bulk-delete";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { useState } from "react";
import UploadButton from "./upload-button";
import ImportCard from "./import-card";
import { transactions as transactionSchema } from "@/db/schema";
import { useSelectAccount } from "@/features/accounts/hooks/use-select-account";
import { toast } from "sonner";
import { useBulkCreateTransactions } from "@/features/transactions/api/use-bulk-create";

enum VARIANTS {
  LIST = "LIST",
  IMPORT = "IMPORT",
}

const INITIAL_IMPORT_RESULTS = {
  data: [],
  errors: [],
  meta: {},
};

const TransactionsPage = () => {
  const [AccountDialog, confirm] = useSelectAccount();
  const [variant, setVariant] = useState<VARIANTS>(VARIANTS.LIST);
  const [importResults, setImportResults] = useState(INITIAL_IMPORT_RESULTS);

  const onUpload = (result: typeof INITIAL_IMPORT_RESULTS) => {
    setImportResults(result);
    setVariant(VARIANTS.IMPORT);
  };

  const onCancelImport = () => {
    setImportResults(INITIAL_IMPORT_RESULTS);
    setVariant(VARIANTS.LIST);
  };

  const newTransaction = useNewTransaction();
  const bulkCreateMutation = useBulkCreateTransactions();
  const deleteTransactions = useBulkDeleteTransactions();
  const transactionQuery = useGetTransactions();
  const transactions = transactionQuery.data || [];

  const isDisabled = transactionQuery.isLoading || deleteTransactions.isPending;

  const onSubmitImport = async (
    values: (typeof transactionSchema.$inferInsert)[]
  ) => {
    const accountId = await confirm();

    if (!accountId) {
      return toast.error("Please select an account to continue");
    }

    const data = values.map((value) => ({
      ...value,
      accountId: accountId as string,
    }));

    bulkCreateMutation.mutate(data, {
      onSuccess: () => {
        onCancelImport();
      },
    });
  };

  if (transactionQuery.isLoading) {
    return (
      <div className=" max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
        <Card className=" border-none drop-shadow-sm">
          <CardHeader>
            <Skeleton className=" h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className=" h-[500px] w-full flex items-center justify-center">
              <Loader2 className=" size-6 text-slate-300 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (variant === VARIANTS.IMPORT) {
    return (
      <>
        <AccountDialog />
        <ImportCard
          data={importResults.data}
          onCancel={onCancelImport}
          onSubmit={onSubmitImport}
        />
      </>
    );
  }

  return (
    <div className=" max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className=" border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className=" text-xl line-clamp-1">
            Transactions page
          </CardTitle>
          <div className=" flex gap-x-2 items-center">
            <Button onClick={newTransaction.onOpen} size="sm">
              <Plus className=" size-4 mr-2" />
              Add new
            </Button>
            <UploadButton onUpload={onUpload} />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            disabled={isDisabled}
            onDelete={(row) => {
              const ids = row.map((r) => r.original.id);
              deleteTransactions.mutate({ ids });
            }}
            filterKey="payee"
            columns={columns}
            data={transactions}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsPage;
