function UtilizationPieChart({ utilizationPercentage }) {
    const data = {
      labels: ["Utilized", "Remaining"],
      datasets: [
        {
          data: [utilizationPercentage, 100 - utilizationPercentage],
          backgroundColor: ["#FF6384", "#36A2EB"],
          hoverBackgroundColor: ["#FF6384", "#36A2EB"],
        },
      ],
    };
  
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: false,
        },
      },
    };
  
    return (
      <div className="flex flex-col items-center">
        <div className="w-32 h-32 relative">
          <Doughnut data={data} options={options} plugins={[centerTextPlugin]} />
        </div>
        <span className="text-sm font-semibold text-gray-700 mt-2">Money Utilized</span>
      </div>
    );
  }
  