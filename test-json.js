const cases = [
  '{\\"type\\":\\"service_account\\"}',
  '{ "type": "service_account" }',
  '"{ \\"type\\": \\"service_account\\" }"',
  '\\{ "type": "service_account" \\}',
  '\'{ \\"type\\": \\"service_account\\" }\'',
  '\\\\{\n  "type": "service_account",\n  "project_id": "test"\n}\\\\'
];

for(let credsJson of cases) {
  try {
      let parsed = JSON.parse(credsJson);
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
      console.log('SUCCESS (native)');
      continue;
  } catch (parseError) {
      try {
        let fixed = credsJson.trim();
        if (fixed.startsWith("'") && fixed.endsWith("'")) {
          fixed = fixed.substring(1, fixed.length - 1);
        }
        if (fixed.startsWith('"') && fixed.endsWith('"')) {
          fixed = fixed.substring(1, fixed.length - 1);
        }
        
        fixed = fixed.replace(/\\{/g, '{').replace(/\\}/g, '}');
        
        const firstIndex = fixed.indexOf('{');
        const lastIndex = fixed.lastIndexOf('}');
        
        if (firstIndex !== -1 && lastIndex !== -1) {
            fixed = fixed.substring(firstIndex, lastIndex + 1);
        }
        
        fixed = fixed.replace(/\\"/g, '"');
        fixed = fixed.replace(/\\\\n/g, '\\n');
        
        let parsed = JSON.parse(fixed);
        if (typeof parsed === 'string') {
            parsed = JSON.parse(parsed);
        }
        console.log('SUCCESS (fallback)');
      } catch (fallbackError) {
        console.log('FAIL (' + fallbackError.message + '):', credsJson);
      }
  }
}
