export async function pollReplicatePrediction(id: string, token: string) {
  let status: string;
  let output: any;
  do {
    await new Promise((res) => setTimeout(res, 1000));
    const check = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    const checkJson = await check.json();
    status = checkJson.status;
    output = checkJson.output;
  } while (status === 'starting' || status === 'processing');
  return { status, output };
}
