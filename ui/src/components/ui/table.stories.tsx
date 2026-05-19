import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./table";

const meta: Meta = {
  title: "UI/Table",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

const rows = [
  { month: "Jan 2025", payment: "$879.12", principal: "$712.45", interest: "$166.67" },
  { month: "Feb 2025", payment: "$879.12", principal: "$718.51", interest: "$160.61" },
  { month: "Mar 2025", payment: "$879.12", principal: "$724.61", interest: "$154.51" },
];

export const Default: Story = {
  render: () => (
    <Table>
      <TableCaption>Amortization schedule</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Month</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Principal</TableHead>
          <TableHead>Interest</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.month}>
            <TableCell>{row.month}</TableCell>
            <TableCell>{row.payment}</TableCell>
            <TableCell>{row.principal}</TableCell>
            <TableCell className="text-destructive">{row.interest}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

export const Empty: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Month</TableHead>
          <TableHead>Payment</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell colSpan={2} className="text-center text-muted-foreground">No data</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};
