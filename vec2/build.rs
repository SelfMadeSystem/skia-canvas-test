use regex::Regex;
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

fn main() {
    let lib_src = fs::read_to_string("src/lib.rs").expect("Failed to read src/lib.rs");
    let exports = parse_exports(&lib_src);
    generate_index_ts(&exports);
}

#[derive(Debug, Clone)]
struct FfiExport {
    name: String,
    args: Vec<String>,
    returns: String,
}

fn parse_exports(src: &str) -> Vec<FfiExport> {
    let mut exports = Vec::new();

    // getter!(vec2_get_x, x);
    let getter_re =
        Regex::new(r"getter!\((\w+),\s*(\w+)\);").expect("Failed to compile getter regex");
    for cap in getter_re.captures_iter(src) {
        let name = cap[1].to_string();
        exports.push(FfiExport {
            name,
            args: vec!["pointer".to_string()],
            returns: "f32".to_string(),
        });
    }

    // setter!(vec2_set_x, x);
    let setter_re =
        Regex::new(r"setter!\((\w+),\s*(\w+)\);").expect("Failed to compile setter regex");
    for cap in setter_re.captures_iter(src) {
        let name = cap[1].to_string();
        exports.push(FfiExport {
            name,
            args: vec!["pointer".to_string(), "f32".to_string()],
            returns: "void".to_string(),
        });
    }

    // binary_op!(vec2_add, +);
    let binary_op_re = Regex::new(r"binary_op!\((\w+),\s*([+\-*/%])\);")
        .expect("Failed to compile binary_op regex");
    for cap in binary_op_re.captures_iter(src) {
        let name = cap[1].to_string();
        exports.push(FfiExport {
            name,
            args: vec!["pointer".to_string(), "pointer".to_string()],
            returns: "pointer".to_string(),
        });
    }

    // binary_fn!(vec2_min, min);
    let binary_fn_re =
        Regex::new(r"binary_fn!\((\w+),\s*(\w+)\);").expect("Failed to compile binary_fn regex");
    for cap in binary_fn_re.captures_iter(src) {
        let name = cap[1].to_string();
        exports.push(FfiExport {
            name,
            args: vec!["pointer".to_string(), "pointer".to_string()],
            returns: "pointer".to_string(),
        });
    }

    // scalar_binary_op!(vec2_dot, dot);
    let scalar_binary_op_re = Regex::new(r"scalar_binary_op!\((\w+),\s*(\w+)\);")
        .expect("Failed to compile scalar_binary_op regex");
    for cap in scalar_binary_op_re.captures_iter(src) {
        let name = cap[1].to_string();
        exports.push(FfiExport {
            name,
            args: vec!["pointer".to_string(), "pointer".to_string()],
            returns: "f32".to_string(),
        });
    }

    // unary_op!(vec2_normalize, normalize);
    let unary_op_re =
        Regex::new(r"unary_op!\((\w+),\s*(\w+)\);").expect("Failed to compile unary_op regex");
    for cap in unary_op_re.captures_iter(src) {
        let name = cap[1].to_string();
        exports.push(FfiExport {
            name,
            args: vec!["pointer".to_string()],
            returns: "pointer".to_string(),
        });
    }

    // scalar_unary_op!(vec2_length, length);
    let scalar_unary_op_re = Regex::new(r"scalar_unary_op!\((\w+),\s*(\w+)\);")
        .expect("Failed to compile scalar_unary_op regex");
    for cap in scalar_unary_op_re.captures_iter(src) {
        let name = cap[1].to_string();
        exports.push(FfiExport {
            name,
            args: vec!["pointer".to_string()],
            returns: "f32".to_string(),
        });
    }

    // Prepend vec2_new and vec2_free (defined manually)
    exports.insert(
        0,
        FfiExport {
            name: "vec2_new".to_string(),
            args: vec!["f32".to_string(), "f32".to_string()],
            returns: "pointer".to_string(),
        },
    );
    exports.insert(
        1,
        FfiExport {
            name: "vec2_free".to_string(),
            args: vec!["pointer".to_string()],
            returns: "void".to_string(),
        },
    );

    // Deduplicate: keep last occurrence (which has correct type)
    let mut seen = HashMap::new();
    for export in exports {
        seen.insert(export.name.clone(), export);
    }

    let mut result: Vec<_> = seen.into_iter().map(|(_, v)| v).collect();
    // Sort to maintain somewhat stable order
    result.sort_by(|a, b| a.name.cmp(&b.name));

    // But put vec2_new and vec2_free first
    result.sort_by_key(|e| match e.name.as_str() {
        "vec2_new" => 0,
        "vec2_free" => 1,
        _ => 2,
    });

    result
}

fn generate_index_ts(exports: &[FfiExport]) {
    let mut content = String::from(
        "///<reference types=\"bun-types\" />\n\nimport { dlopen, FFIType, suffix } from 'bun:ffi'\n\n",
    );

    content.push_str("const { f32, pointer } = FFIType;\n\n");
    content.push_str("const libPath = `./target/release/libvec2.${suffix}`\n\n");
    content.push_str("export const { symbols } = dlopen(libPath, {\n");

    for (i, export) in exports.iter().enumerate() {
        let args_str = export
            .args
            .iter()
            .map(|arg| match arg.as_str() {
                "f32" => "f32",
                "pointer" => "pointer",
                _ => arg,
            })
            .collect::<Vec<_>>()
            .join(", ");

        let returns_str = match export.returns.as_str() {
            "f32" => "f32",
            "pointer" => "pointer",
            "void" => "'void'",
            _ => &export.returns,
        };

        content.push_str(&format!(
            "    {}: {{\n        args: [{}],\n        returns: {},\n    }}",
            export.name, args_str, returns_str
        ));

        if i < exports.len() - 1 {
            content.push(',');
        }
        content.push('\n');
    }

    content.push_str("});\n");

    let out_path = PathBuf::from("bun.ts");
    fs::write(&out_path, content).expect("Failed to write bun.ts");
}
