export function exportWidgetAsCSV(title: string, data: any[]): void {
  if (!data || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(",")];
  data.forEach(row => {
    csvRows.push(headers.map(h => {
      const val = row[h];
      const str = val === null || val === undefined ? "" : String(val);
      return str.includes(",") || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(","));
  });
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[^a-z0-9]/gi, "_")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportWidgetAsPNG(chartRef: HTMLDivElement | null, title: string): Promise<void> {
  if (!chartRef) return;
  try {
    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(chartRef, { backgroundColor: "#ffffff", pixelRatio: 2 });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${title.replace(/[^a-z0-9]/gi, "_")}.png`;
    a.click();
  } catch (e) {
    console.error("PNG export failed", e);
  }
}
