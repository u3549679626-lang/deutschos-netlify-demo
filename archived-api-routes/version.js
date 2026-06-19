export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    step: 'Step 10',
    apiVersion: 'auth-rbac-2026-06-19',
    commitHint: 'a02623f-plus-version-route'
  });
}
