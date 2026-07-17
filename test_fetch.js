fetch('http://localhost:3000/api/public/offres')
  .then(res => res.json())
  .then(data => {
    const jobs = data.data || data;
    const missing = jobs.filter(j => !j.imageUrl && !j.logoUrl);
    console.log("Missing images count:", missing.length);
    console.log("Sample missing:", missing[0]);
    console.log("Total jobs:", jobs.length);
  });
