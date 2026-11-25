import com.github.megatronking.stringfog.IKeyGenerator;
import com.github.megatronking.stringfog.IStringFog;
import com.github.megatronking.stringfog.plugin.ClassVisitorFactory;
import com.github.megatronking.stringfog.plugin.StringFogMode;
import com.github.megatronking.stringfog.plugin.kg.HardCodeKeyGenerator;
import org.objectweb.asm.ClassReader;
import org.objectweb.asm.ClassVisitor;
import org.objectweb.asm.ClassWriter;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Standalone StringFog pass for the WebView payload:
 * compiled classes in -> StringFog-encrypted classes out.
 *
 * args: inputDir outputDir wrapperClass implClass keyHex packages mode [skipClasses]
 * wrapperClass/implClass are dotted names; packages is comma separated (dotted).
 */
public final class PayloadStringFog {

    public static void main(String[] args) throws Exception {
        Path input = Paths.get(args[0]);
        Path output = Paths.get(args[1]);
        String wrapper = args[2];
        String impl = args[3];
        String keyHex = args[4];
        String[] packages = args[5].split(",");
        StringFogMode mode = StringFogMode.valueOf(args[6]);
        Set<String> skip = new HashSet<>();
        if (args.length > 7) {
            for (String value : args[7].split(",")) {
                if (!value.isEmpty()) skip.add(value);
            }
        }

        IStringFog fog = (IStringFog) Class.forName(impl).getDeclaredConstructor().newInstance();
        IKeyGenerator keys = new HardCodeKeyGenerator(hex(keyHex));
        String wrapperInternal = wrapper.replace('.', '/');

        List<Path> files = new ArrayList<>();
        Files.walk(input).filter(path -> path.toString().endsWith(".class")).forEach(files::add);
        for (Path file : files) {
            byte[] bytes = Files.readAllBytes(file);
            ClassReader reader = new ClassReader(bytes);
            String name = reader.getClassName();
            Path target = output.resolve(input.relativize(file).toString());
            Files.createDirectories(target.getParent());

            if (skip.contains(name) || name.equals(wrapperInternal)) {
                Files.write(target, bytes);
                continue;
            }

            ClassWriter writer = new ClassWriter(reader, ClassWriter.COMPUTE_MAXS);
            ClassVisitor visitor = ClassVisitorFactory.create(
                    fog,
                    new ArrayList<>(),
                    packages,
                    keys,
                    wrapperInternal,
                    name,
                    mode,
                    writer);
            reader.accept(visitor, 0);
            Files.write(target, writer.toByteArray());
        }
    }

    private static byte[] hex(String value) {
        byte[] out = new byte[value.length() / 2];
        for (int i = 0; i < out.length; i++) {
            out[i] = (byte) Integer.parseInt(value.substring(i * 2, i * 2 + 2), 16);
        }
        return out;
    }
}
