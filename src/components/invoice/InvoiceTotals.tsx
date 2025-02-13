
interface InvoiceTotalsProps {
  totalHT: number;
  tvaRate: number;
  totalTTC: number;
}

export const InvoiceTotals = ({ totalHT, tvaRate, totalTTC }: InvoiceTotalsProps) => {
  return (
    <div className="space-y-2 text-right">
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">Total HT:</span>
        <span className="font-medium">
          {totalHT.toLocaleString('fr-CH', {
            style: 'currency',
            currency: 'CHF'
          })}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">TVA ({tvaRate}%):</span>
        <span className="font-medium">
          {((totalHT * tvaRate) / 100).toLocaleString('fr-CH', {
            style: 'currency',
            currency: 'CHF'
          })}
        </span>
      </div>
      <div className="flex justify-between items-center text-lg font-bold">
        <span>Total TTC:</span>
        <span>
          {totalTTC.toLocaleString('fr-CH', {
            style: 'currency',
            currency: 'CHF'
          })}
        </span>
      </div>
    </div>
  );
};
